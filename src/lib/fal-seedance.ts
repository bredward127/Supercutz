import "server-only";
import type { GenerateVideoRequest } from "./generate-video-api";

// Maps our request shape to fal's Seedance Reference-to-Video input shape.
// Verified against @fal-ai/client's Seedance2R2VInput type (image_urls,
// video_urls, audio_urls, prompt, resolution, duration as a string, and
// aspect_ratio) — see src/lib/models.ts for what's confirmed vs assumed
// about which fal endpoint this actually posts to.
export function buildSeedanceReferenceToVideoInput(input: GenerateVideoRequest): Record<string, unknown> {
  return {
    prompt: input.prompt,
    image_urls: input.assetUrls.images.length > 0 ? input.assetUrls.images : undefined,
    video_urls: input.assetUrls.videos.length > 0 ? input.assetUrls.videos : undefined,
    audio_urls: input.assetUrls.audio.length > 0 ? input.assetUrls.audio : undefined,
    resolution: input.resolution,
    duration: String(input.durationSeconds),
    aspect_ratio: input.aspectRatio,
  };
}
