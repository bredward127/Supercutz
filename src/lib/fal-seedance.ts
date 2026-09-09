import "server-only";
import type { GenerateVideoRequest } from "./generate-video-api";

// Maps our request shape to Seedance 2.5's Reference-to-Video input shape.
// Verified against fal.ai's own published Node.js docs for
// bytedance/seedance-2.5/reference-to-video: image_urls, video_urls,
// audio_urls, prompt, resolution, duration (a string, or "auto" — this app
// always sends an explicit number), aspect_ratio, and generate_audio
// (native synchronized audio, default true; distinct from audio_urls, which
// are reference audio files). bitrate_mode and seed also exist on this
// endpoint but have no UI in this app, so they're left at their defaults.
export function buildSeedanceReferenceToVideoInput(input: GenerateVideoRequest): Record<string, unknown> {
  return {
    prompt: input.prompt,
    image_urls: input.assetUrls.images.length > 0 ? input.assetUrls.images : undefined,
    video_urls: input.assetUrls.videos.length > 0 ? input.assetUrls.videos : undefined,
    audio_urls: input.assetUrls.audio.length > 0 ? input.assetUrls.audio : undefined,
    resolution: input.resolution,
    duration: String(input.durationSeconds),
    aspect_ratio: input.aspectRatio,
    generate_audio: true,
  };
}
