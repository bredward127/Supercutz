import "server-only";
import type { GenerateVideoRequest } from "./generate-video-api";

// Kling O3 4K Video-to-Video (Reference). Verified against fal.ai's
// published Node.js docs for fal-ai/kling-video/o3/4k/video-to-video/reference:
// a single required video_url, up to 4 style/appearance image_urls, and a
// keep_audio boolean (we always keep the source video's own audio, since
// this app has no separate audio upload for Kling models). This is the only
// one of the three Kling models with an aspect_ratio/duration parameter.
export function buildKlingO3FourKReferenceInput(input: GenerateVideoRequest): Record<string, unknown> {
  return {
    prompt: input.prompt,
    video_url: input.assetUrls.videos[0],
    image_urls: input.assetUrls.images.length > 0 ? input.assetUrls.images : undefined,
    keep_audio: true,
    aspect_ratio: input.aspectRatio,
    duration: String(input.durationSeconds),
  };
}

// Kling O3 Edit Video (Pro) Video-to-Video. Verified against fal.ai's
// published Node.js docs for fal-ai/kling-video/o3/pro/video-to-video/edit:
// same required video_url / optional image_urls / keep_audio shape as the 4K
// reference model above, but this endpoint has no aspect_ratio or duration
// parameter at all — output length and frame follow the source video.
export function buildKlingO3ProEditInput(input: GenerateVideoRequest): Record<string, unknown> {
  return {
    prompt: input.prompt,
    video_url: input.assetUrls.videos[0],
    image_urls: input.assetUrls.images.length > 0 ? input.assetUrls.images : undefined,
    keep_audio: true,
  };
}

// Kling v3 Pro Image-to-Video. Verified against fal.ai's published Node.js
// docs for fal-ai/kling-video/v3/pro/image-to-video: a required
// start_image_url, an optional end_image_url, and a duration (3-15s). No
// resolution or aspect_ratio parameter. generate_audio produces the model's
// own native audio track rather than accepting an audio upload.
export function buildKlingV3ProImageToVideoInput(input: GenerateVideoRequest): Record<string, unknown> {
  return {
    prompt: input.prompt,
    start_image_url: input.assetUrls.images[0],
    end_image_url: input.assetUrls.images[1] || undefined,
    duration: String(input.durationSeconds),
    generate_audio: true,
  };
}
