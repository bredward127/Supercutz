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
// src/lib/fal-seedance.ts.
export const SUPPORTED_GENERATE_VIDEO_MODEL_IDS = [
  "seedance-2-reference-to-video",
  "seedance-2-fast-reference-to-video",
  "seedance-2-5-reference-to-video",
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
    body.resolution.trim().length === 0 ||
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

  if (!model.resolutions.includes(input.resolution)) {
    errors.push(`${model.label} supports resolutions ${model.resolutions.join(", ")}; got "${input.resolution}".`);
  }

  if (!model.aspectRatios.includes(input.aspectRatio)) {
    errors.push(`${model.label} supports aspect ratios ${model.aspectRatios.join(", ")}; got "${input.aspectRatio}".`);
  }

  return errors;
}
