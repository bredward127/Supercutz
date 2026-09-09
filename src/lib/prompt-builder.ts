// Builds the model-ready generation prompt deterministically from a
// template, rather than asking Claude to write it.
//
// Why deterministic: every one of the eight required sections maps
// directly onto data we already have exactly — the asset list and its
// order, the campaign fields, and the production script's own per-beat
// fields (Spoken/Visual/Edit/Must preserve) from the generate-script /
// reformat-transcript / resize-script stage. There's nothing left for an
// LLM to creatively add, and this prompt is about to drive a paid fal.ai
// video generation, so predictable, non-hallucinating output (exact
// @ImageN/@VideoN/@AudioN numbering, exact section order) matters more
// than prose quality. A template also means this route needs no
// ANTHROPIC_API_KEY, has no latency, and costs nothing to run.

import { categorizeAssetRole, type AssetCategory } from "./asset-roles";
import type { FalVideoModel } from "./models";
import type { BuildPromptRequest } from "./build-prompt-api";

export interface AssetReference {
  role: string;
  tag: string;
  label: string;
  description: string;
  category: AssetCategory;
}

export function buildAssetReferences(assetRoles: string[]): AssetReference[] {
  const counters: Record<AssetCategory, number> = { video: 0, image: 0, audio: 0 };
  const tagPrefix: Record<AssetCategory, string> = { video: "Video", image: "Image", audio: "Audio" };

  return assetRoles.map((role) => {
    const info = categorizeAssetRole(role);
    counters[info.category] += 1;
    return {
      role,
      tag: `@${tagPrefix[info.category]}${counters[info.category]}`,
      label: info.label,
      description: info.description,
      category: info.category,
    };
  });
}

export interface ScriptBeat {
  timecode: string;
  tag: string;
  name: string;
  spoken: string;
  visual: string;
  scene: string;
  object: string;
  edit: string;
  mustPreserve: string;
}

const BEAT_HEADER_RE = /^\[([^\]]+)\]\s*(KEEP|CUT)\s*\|\s*\[([^\]]+)\]/i;

function extractField(block: string, field: string): string {
  const match = block.match(new RegExp(`^${field}:\\s*(.*)$`, "im"));
  return match ? match[1].trim().replace(/^"(.*)"$/, "$1") : "";
}

export function parseScriptBeats(script: string): ScriptBeat[] {
  const blocks = script
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const beats: ScriptBeat[] = [];
  for (const block of blocks) {
    const header = block.match(BEAT_HEADER_RE);
    if (!header) continue;

    beats.push({
      timecode: header[1].trim(),
      tag: header[2].toUpperCase(),
      name: header[3].trim(),
      spoken: extractField(block, "Spoken"),
      visual: extractField(block, "Visual"),
      scene: extractField(block, "Scene"),
      object: extractField(block, "Object"),
      edit: extractField(block, "Edit"),
      mustPreserve: extractField(block, "Must preserve"),
    });
  }
  return beats;
}

function buildSourcePreservation(refs: AssetReference[], model: FalVideoModel): string {
  const sourceVideo = refs.find((ref) => ref.role === "source_video");
  const styleVideo = refs.find((ref) => ref.role === "style_video");
  const lines: string[] = [];

  if (sourceVideo) {
    lines.push(
      `${sourceVideo.tag} is the source video${
        model.category === "video-edit" ? " to edit in place" : ", used as the driving reference for the new generation"
      }. Preserve the exact identity, facial features, skin tone, body proportions, wardrobe, and voice of the presenter shown in ${sourceVideo.tag}. Do not regenerate, restyle, or replace the presenter — every frame must remain recognizably the same person performing the same actions captured in ${sourceVideo.tag}.`
    );
  } else {
    lines.push(
      "No source video was provided. Generate the presenter and setting fresh from the other sections below."
    );
  }

  if (styleVideo) {
    lines.push(
      `${styleVideo.tag} is a style/pacing reference only — copy its visual style, camera movement, and editing rhythm, but do not copy its subject, footage, dialogue, or audio into the output.`
    );
  }

  return lines.join("\n");
}

function buildReferenceRoles(refs: AssetReference[]): string {
  if (refs.length === 0) {
    return "No reference assets were provided for this generation.";
  }
  return refs.map((ref) => `${ref.tag} — ${ref.label} (${ref.role}): ${ref.description}`).join("\n");
}

function buildNarrativeAndTiming(input: BuildPromptRequest, beats: ScriptBeat[]): string {
  const header = `Total target runtime: ${input.targetDurationSeconds} seconds. Follow the production script below beat by beat, matching each beat's timecode and spoken line exactly.`;
  const keepBeats = beats.filter((beat) => beat.tag === "KEEP");

  if (keepBeats.length === 0) {
    return `${header}\n\n${input.productionScript.trim()}`;
  }

  const lines = keepBeats.map(
    (beat) =>
      `[${beat.timecode}] [${beat.name}] Spoken: "${beat.spoken}" | Visual: ${beat.visual || "unspecified"} | Scene: ${beat.scene || "unspecified"}`
  );
  return `${header}\n\n${lines.join("\n")}`;
}

function buildEnvironmentObjectChanges(input: BuildPromptRequest, refs: AssetReference[]): string {
  const environment = input.environmentDescription.trim();
  const objectReplacement = input.objectReplacementDescription.trim();
  const lines = [
    `Environment: ${environment || "No environment changes specified — keep the original setting from the source video unchanged."}`,
    `Object replacement: ${objectReplacement || "No object replacement specified — keep all original objects and props as they appear in the source video."}`,
  ];

  const visualRefs = refs.filter((ref) =>
    ["product_image", "logo", "environment_reference"].includes(ref.role)
  );
  if (visualRefs.length > 0 && (environment || objectReplacement)) {
    lines.push(
      `Match the appearance of any replaced object, product, or environment element to: ${visualRefs
        .map((ref) => `${ref.tag} (${ref.label})`)
        .join(", ")}.`
    );
  }

  return lines.join("\n");
}

function withIndefiniteArticle(word: string): string {
  return /^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`;
}

function buildVisualDirection(input: BuildPromptRequest, refs: AssetReference[], model: FalVideoModel): string {
  const campaignType = input.campaignType.trim();
  const lines = [
    `Deliver in ${input.aspectRatio} aspect ratio for a ${input.targetDurationSeconds}-second video${
      campaignType ? `, ${withIndefiniteArticle(campaignType)} ad` : ""
    }. Keep key action, faces, and any on-screen text safely inside frame for this ratio.`,
  ];

  const styleTags = refs
    .filter((ref) => ref.role === "source_video" || ref.role === "style_video")
    .map((ref) => ref.tag);
  if (styleTags.length > 0) {
    lines.push(`Match the lighting, color grade, and camera feel of ${styleTags.join(" and ")} throughout.`);
  }

  if (!model.aspectRatios.includes(input.aspectRatio)) {
    lines.push(
      `Note: ${model.label} lists supported aspect ratios as ${model.aspectRatios.join(", ")} — confirm ${input.aspectRatio} is compatible before submission.`
    );
  }

  return lines.join("\n");
}

function buildEditDirection(input: BuildPromptRequest, beats: ScriptBeat[]): string {
  const keepEdits = beats.filter((beat) => beat.tag === "KEEP" && beat.edit);
  const cutBeats = beats.filter((beat) => beat.tag === "CUT");
  const lines: string[] = [];

  if (keepEdits.length > 0) {
    lines.push("Follow the per-beat edit instructions from the production script:");
    lines.push(...keepEdits.map((beat) => `- [${beat.name}]: ${beat.edit}`));
  } else {
    lines.push(
      `No explicit edit instructions were found in the production script — cut tightly beat-to-beat with no dead air, matching the pacing implied by the script's timecodes, for a total of ${input.targetDurationSeconds} seconds.`
    );
  }

  if (cutBeats.length > 0) {
    lines.push("");
    lines.push("The following beats are marked CUT in the script and must be excluded entirely from the final edit:");
    lines.push(...cutBeats.map((beat) => `- [${beat.name}] (${beat.timecode}): "${beat.spoken}"`));
  }

  return lines.join("\n");
}

function buildBrandRestrictions(beats: ScriptBeat[], refs: AssetReference[]): string {
  const lines: string[] = [];

  const preserved = beats.filter(
    (beat) => beat.tag === "KEEP" && beat.mustPreserve && beat.mustPreserve.toLowerCase() !== "none"
  );
  if (preserved.length > 0) {
    lines.push("Preserve exactly, as specified in the production script:");
    lines.push(...preserved.map((beat) => `- [${beat.name}]: ${beat.mustPreserve}`));
  }

  const logo = refs.find((ref) => ref.role === "logo");
  if (logo) {
    lines.push(`${logo.tag} (logo) must remain pixel-accurate wherever it appears — no recoloring, distortion, or redesign.`);
  }

  return lines.length > 0 ? lines.join("\n") : "No specific brand restrictions were flagged in the production script.";
}

function buildNegativeConstraints(input: BuildPromptRequest, model: FalVideoModel): string {
  const lines = [
    "- Do not add on-screen text, captions, or graphics that are not explicitly described above.",
    "- Do not alter the presenter's face, body, voice, or identity.",
    "- Do not introduce new products, brands, or logos that were not supplied as reference assets.",
    "- Do not add background music or sound effects unless explicitly requested above.",
    `- Do not exceed the target duration of ${input.targetDurationSeconds} seconds.`,
  ];

  if (!model.supportsAudio) {
    lines.push(
      `- ${model.label} does not accept audio input — do not expect lip-synced dialogue from this generation; treat "Spoken" lines as guidance for on-screen captions or voice added in post-production.`
    );
  }

  return lines.join("\n");
}

export function buildModelPrompt(input: BuildPromptRequest, model: FalVideoModel): string {
  const refs = buildAssetReferences(input.assetRoles);
  const beats = parseScriptBeats(input.productionScript);

  const sections: Array<[string, string]> = [
    ["1. SOURCE PRESERVATION", buildSourcePreservation(refs, model)],
    ["2. REFERENCE ROLES", buildReferenceRoles(refs)],
    ["3. NARRATIVE AND SPOKEN TIMING", buildNarrativeAndTiming(input, beats)],
    ["4. ENVIRONMENT / OBJECT CHANGES", buildEnvironmentObjectChanges(input, refs)],
    ["5. VISUAL DIRECTION", buildVisualDirection(input, refs, model)],
    ["6. EDIT DIRECTION", buildEditDirection(input, beats)],
    ["7. BRAND RESTRICTIONS", buildBrandRestrictions(beats, refs)],
    ["8. NEGATIVE CONSTRAINTS", buildNegativeConstraints(input, model)],
  ];

  return sections.map(([title, body]) => `${title}\n${body}`).join("\n\n");
}
