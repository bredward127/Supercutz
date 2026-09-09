// Request/response contract for POST /api/generate-video, plus the
// registry-limit validation the route runs before submitting to fal.

import type { FalVideoModel } from "./models";

export interface GenerateVideoRequest {
  modelId: string;
  prompt: string;
  assetUrls: {
    images: string[];
    videos: string[];
    audio: string[];
  };
  resolution: string;
  durationSeconds: number;
  aspectRatio: string;
}

export interface GenerateVideoResponse {
  requestId: string;
  status: "queued";
  queuePosition?: number;
}

// Models with a working fal adapter as of this stage. Keep in sync with
// src/lib/fal-seedance.ts and src/lib/fal-kling.ts. Seedance 2.0 and 2.0
// Fast are excluded — their endpoint strings are unverified guesses (the
// same guessing method produced a confirmed-404 wrong string for 2.5) and
// are marked "experimental" in src/lib/models.ts until checked for real.
export const SUPPORTED_GENERATE_VIDEO_MODEL_IDS = [
  "seedance-2-5-reference-to-video",
  "kling-o3-4k-video-to-video-reference",
  "kling-o3-pro-video-to-video-edit",
  "kling-v3-pro-image-to-video",
] as const;

export type SupportedGenerateVideoModelId = (typeof SUPPORTED_GENERATE_VIDEO_MODEL_IDS)[number];

export function isSupportedGenerateVideoModelId(id: string): id is SupportedGenerateVideoModelId {
  return (SUPPORTED_GENERATE_VIDEO_MODEL_IDS as readonly string[]).includes(id);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseGenerateVideoRequest(body: Record<string, unknown>): GenerateVideoRequest | null {
  if (
    typeof body.modelId !== "string" ||
    body.modelId.trim().length === 0 ||
    typeof body.prompt !== "string" ||
    body.prompt.trim().length === 0 ||
    typeof body.resolution !== "string" ||
    typeof body.aspectRatio !== "string" ||
    body.aspectRatio.trim().length === 0 ||
    typeof body.durationSeconds !== "number" ||
    !Number.isFinite(body.durationSeconds) ||
    body.durationSeconds <= 0 ||
    typeof body.assetUrls !== "object" ||
    body.assetUrls === null
  ) {
    return null;
  }

  const assetUrls = body.assetUrls as Record<string, unknown>;
  if (!isStringArray(assetUrls.images) || !isStringArray(assetUrls.videos) || !isStringArray(assetUrls.audio)) {
    return null;
  }

  return {
    modelId: body.modelId,
    prompt: body.prompt,
    assetUrls: { images: assetUrls.images, videos: assetUrls.videos, audio: assetUrls.audio },
    resolution: body.resolution,
    durationSeconds: body.durationSeconds,
    aspectRatio: body.aspectRatio,
  };
}

// Returns a list of human-readable violations; empty means the request is
// within the model's registry limits.
export function validateAgainstModel(input: GenerateVideoRequest, model: FalVideoModel): string[] {
  const errors: string[] = [];
  const { images, videos, audio } = input.assetUrls;

  if (model.maxPromptLength !== undefined && input.prompt.length > model.maxPromptLength) {
    errors.push(
      `${model.label} limits prompts to ${model.maxPromptLength} characters; yours is ${input.prompt.length}. Trim it in the Script section before generating.`
    );
  }

  if (images.length > 0 && !model.supportsImages) {
    errors.push(`${model.label} does not accept image inputs.`);
  } else if (images.length > model.maxImages) {
    errors.push(`${model.label} supports at most ${model.maxImages} image(s); got ${images.length}.`);
  }

  if (videos.length > 0 && !model.supportsVideos) {
    errors.push(`${model.label} does not accept video inputs.`);
  } else if (videos.length > model.maxVideos) {
    errors.push(`${model.label} supports at most ${model.maxVideos} video(s); got ${videos.length}.`);
  }

  if (audio.length > 0 && !model.supportsAudio) {
    errors.push(`${model.label} does not accept audio inputs.`);
  } else if (audio.length > model.maxAudio) {
    errors.push(`${model.label} supports at most ${model.maxAudio} audio file(s); got ${audio.length}.`);
  }

  if (input.durationSeconds < model.minDuration || input.durationSeconds > model.maxDuration) {
    errors.push(
      `${model.label} supports durations between ${model.minDuration} and ${model.maxDuration} seconds; got ${input.durationSeconds}.`
    );
  }

  // An empty resolutions/aspectRatios array means the model has no such
  // parameter at all (e.g. Kling), not "nothing is allowed" — skip the
  // check entirely rather than rejecting every request.
  if (model.resolutions.length > 0 && !model.resolutions.includes(input.resolution)) {
    errors.push(`${model.label} supports resolutions ${model.resolutions.join(", ")}; got "${input.resolution}".`);
  }

  if (model.aspectRatios.length > 0 && !model.aspectRatios.includes(input.aspectRatio)) {
    errors.push(`${model.label} supports aspect ratios ${model.aspectRatios.join(", ")}; got "${input.aspectRatio}".`);
  }

  if (model.requiredAsset === "video" && videos.length === 0) {
    errors.push(`${model.label} requires a video to edit.`);
  } else if (model.requiredAsset === "image" && images.length === 0) {
    errors.push(`${model.label} requires at least one image.`);
  } else if (model.requiredAsset === "any-visual" && videos.length === 0 && images.length === 0) {
    errors.push(`${model.label} requires at least one image or video reference.`);
  }

  return errors;
}
