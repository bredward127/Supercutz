import "server-only";
import { calculateTargetWordCountRange } from "./pacing";
import type {
  CampaignContext,
  GenerateScriptRequest,
  ReformatTranscriptRequest,
  ResizeScriptRequest,
} from "./script-api";

const SCRIPT_FORMAT_SPEC = `Every beat must use exactly this format, with no extra commentary before, between, or after beats:

[MM:SS-MM:SS] KEEP | [BEAT NAME]
Spoken: "..."
Visual: ...
Scene: ...
Object: ... or None
Edit: ...
Must preserve: ...

Formatting rules:
- MM:SS-MM:SS is the beat's timecode range within the total duration, starting at 00:00.
- The tag right after the timecode is either KEEP or CUT (uppercase, no other values).
- [BEAT NAME] is a short label in square brackets, e.g. [HOOK], [PROBLEM], [SOLUTION], [PROOF], [CTA].
- "Spoken" is the exact spoken line for that beat, in double quotes.
- "Visual" describes what is on screen during the beat.
- "Scene" names the setting or location.
- "Object" names a specific product, prop, or asset visible in the beat, or the literal word None.
- "Edit" is a short instruction for the editor (cut type, pacing, transition, on-screen text, etc.).
- "Must preserve" notes anything in the beat that must not be altered or dropped later (e.g. legal disclaimer, exact CTA wording, brand name spelling).
- Separate beats with a single blank line.
- Output nothing except the beat blocks themselves — no title, no summary, no markdown headers, no numbered list.`;

function formatCampaignContext(context: CampaignContext): string {
  const assetLabels =
    context.availableAssetLabels.length > 0
      ? context.availableAssetLabels.join(", ")
      : "none provided";

  return [
    `Campaign type: ${context.campaignType || "not specified"}`,
    `Offer: ${context.offer || "not specified"}`,
    `Call to action: ${context.cta || "not specified"}`,
    `Audience: ${context.audience || "not specified"}`,
    `Tone: ${context.tone || "not specified"}`,
    `Target duration: ${context.targetDurationSeconds} seconds`,
    `Available asset labels: ${assetLabels}`,
  ].join("\n");
}

export function buildGenerateScriptPrompt(input: GenerateScriptRequest): {
  system: string;
  user: string;
} {
  const { min, max } = calculateTargetWordCountRange(input.targetDurationSeconds);

  const system = `You are a professional direct-response video ad scriptwriter and editor. You write tight, high-conversion short-form ad scripts.

${SCRIPT_FORMAT_SPEC}`;

  const user = `Write a new production script for a ${input.targetDurationSeconds}-second video ad.

${formatCampaignContext(input)}

Pacing target: 130-150 words per minute of spoken dialogue. For ${input.targetDurationSeconds} seconds, the total spoken word count across all beats should be approximately ${min}-${max} words — stay within that range.

This is a fresh script, so every beat should be marked KEEP. Use the available asset labels to decide what to show on screen where it strengthens a beat (e.g. reference the logo, product shots, or screenshots), and set Object to None when no specific asset applies to a beat.`;

  return { system, user };
}

export function buildReformatTranscriptPrompt(input: ReformatTranscriptRequest): {
  system: string;
  user: string;
} {
  const { min, max } = calculateTargetWordCountRange(input.targetDurationSeconds);

  const system = `You are a professional video ad editor. You take raw, unedited transcripts and normalize them into a tight ad script.

${SCRIPT_FORMAT_SPEC}`;

  const user = `Reformat the following raw transcript into a normalized production script for a ${input.targetDurationSeconds}-second video ad.

${formatCampaignContext(input)}

Break the transcript into beats in chronological order. Mark a beat KEEP if it is strong, on-message, and worth using. Mark a beat CUT if it is weak, filler, repetitive, off-topic, or silence-heavy. Include every beat from the transcript in the output, in order, tagged KEEP or CUT — do not silently drop CUT beats. Only the KEEP beats count toward pacing: aim for the combined spoken word count of the KEEP beats to land around ${min}-${max} words, matching 130-150 words per minute for a ${input.targetDurationSeconds}-second final cut.

Raw transcript:
"""
${input.rawTranscript}
"""`;

  return { system, user };
}

export function buildResizeScriptPrompt(input: ResizeScriptRequest): {
  system: string;
  user: string;
} {
  const { min, max } = calculateTargetWordCountRange(input.targetDurationSeconds);

  const system = `You are a professional video ad editor. You take an existing production script and re-cut it to a new target duration without losing what makes it work.

${SCRIPT_FORMAT_SPEC}`;

  const user = `Revise the following production script to fit a new target duration of ${input.targetDurationSeconds} seconds.

Pacing target: 130-150 words per minute. For ${input.targetDurationSeconds} seconds, the combined spoken word count of all KEEP beats should be approximately ${min}-${max} words.

You must preserve the hook (the opening beat that grabs attention), the core benefit or value proposition, and the call to action — keep these in the final KEEP beats. Trim, tighten, merge, or mark other beats CUT as needed to hit the new duration. Re-timecode every beat's [MM:SS-MM:SS] against the new total duration, starting at 00:00.

Existing production script:
"""
${input.script}
"""`;

  return { system, user };
}
