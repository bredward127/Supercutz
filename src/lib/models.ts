// Registry of fal.ai video models available to the app. This file is data
// only — UI components read from it, they don't branch on model names.
//
// Seedance 2.0 / 2.0 Fast / 2.5 Reference-to-Video (three of the six models
// with a working adapter as of the generate-video route): supportsImages/
// Videos/Audio, maxImages/Videos/Audio, minDuration/maxDuration, and
// resolutions below are verified against the actual input schema shipped in
// @fal-ai/client's type definitions (Seedance2R2VInput) — max 9 images, max 3
// videos (combined duration 2-15s), max 3 audio files (combined duration
// <=15s), duration 4-15s, resolutions 480p/720p. The `falEndpoint` path
// strings for these three are NOT verified: the installed SDK's endpoint map
// only registers Seedance v1/v1.5 paths, not v2 — v2's Input/Output types
// exist but no endpoint ID string is published there yet. The paths below
// follow the same naming convention as the confirmed v1/v1.5 endpoints;
// confirm the exact string in the fal.ai dashboard before spending real
// generation credits, and note that 2.5 is assumed (not confirmed) to share
// 2.0's parameter shape.
//
// Kling O3 4K Video-to-Video (Reference), Kling O3 Edit Video (Pro)
// Video-to-Video, and Kling v3 Pro Image-to-Video are the other three
// working models, verified against fal.ai's own published Node.js API docs
// (endpoint IDs, input/output schemas) for each of those three exact pages.
// None of the three take a `resolution` parameter (resolutions: []); only
// the 4K reference model takes `aspect_ratio` (the edit-pro and image-to-
// video models don't — aspectRatios: [] for those two). Neither
// video-to-video model has a second "style video" slot (maxVideos: 1) — only
// a single required video plus up to 4 style/appearance images. Kling's
// "elements" (named character/object references) and multi-shot
// `multi_prompt` storyboards are real fields on these endpoints but have no
// UI in this app yet, so the adapters never send them.
//
// Kling O1 Video-to-Video Edit remains an experimental placeholder: its
// endpoint ID was confirmed against the installed SDK's type definitions,
// but no fal.ai docs page schema has been checked against it, and no adapter
// exists for it yet.

export type ModelCategory =
  | "reference-to-video"
  | "video-edit"
  | "image-to-video"
  | "text-to-video"
  | "image-generation"
  | "utility";

export type ModelStatus = "enabled" | "experimental" | "disabled";

export type PromptTemplateType =
  | "reference-to-video"
  | "video-edit"
  | "image-to-video"
  | "text-to-video"
  | "image-generation";

// What GenerationPanel must see uploaded before it will allow a submission:
// "any-visual" (Seedance) accepts a source video, a style video, or images,
// in any combination; "video" (Kling's video-edit models) requires the
// single source video specifically; "image" (Kling's image-to-video model)
// requires at least one image, since the first upload becomes the required
// start frame.
export type RequiredAssetKind = "any-visual" | "video" | "image";

export interface FalVideoModel {
  id: string;
  label: string;
  falEndpoint: string;
  category: ModelCategory;
  supportsImages: boolean;
  supportsVideos: boolean;
  supportsAudio: boolean;
  maxImages: number;
  maxVideos: number;
  maxAudio: number;
  minDuration: number;
  maxDuration: number;
  // Empty array means the model has no such parameter at all (not just
  // "anything goes") — GenerationPanel hides the corresponding control and
  // validateAgainstModel skips the check entirely rather than rejecting an
  // empty selection.
  aspectRatios: string[];
  resolutions: string[];
  requiredAsset: RequiredAssetKind;
  promptTemplateType: PromptTemplateType;
  pricingNote: string;
  status: ModelStatus;
}

export const FAL_VIDEO_MODELS: FalVideoModel[] = [
  {
    id: "seedance-2-reference-to-video",
    label: "Seedance 2.0 Reference-to-Video",
    falEndpoint: "fal-ai/bytedance/seedance/v2/reference-to-video",
    category: "reference-to-video",
    supportsImages: true,
    supportsVideos: true,
    supportsAudio: true,
    maxImages: 9,
    maxVideos: 3,
    maxAudio: 3,
    minDuration: 4,
    maxDuration: 15,
    aspectRatios: ["auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
    resolutions: ["480p", "720p"],
    requiredAsset: "any-visual",
    promptTemplateType: "reference-to-video",
    pricingNote: "Pricing per fal.ai — confirm current rate before use.",
    status: "enabled",
  },
  {
    id: "seedance-2-fast-reference-to-video",
    label: "Seedance 2.0 Fast Reference-to-Video",
    falEndpoint: "fal-ai/bytedance/seedance/v2/fast/reference-to-video",
    category: "reference-to-video",
    supportsImages: true,
    supportsVideos: true,
    supportsAudio: true,
    maxImages: 9,
    maxVideos: 3,
    maxAudio: 3,
    minDuration: 4,
    maxDuration: 15,
    aspectRatios: ["auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
    resolutions: ["480p", "720p"],
    requiredAsset: "any-visual",
    promptTemplateType: "reference-to-video",
    pricingNote: "Faster/cheaper variant of Seedance 2.0 — confirm current rate before use.",
    status: "enabled",
  },
  {
    id: "seedance-2-5-reference-to-video",
    label: "Seedance 2.5 Reference-to-Video",
    falEndpoint: "fal-ai/bytedance/seedance/v2.5/reference-to-video",
    category: "reference-to-video",
    supportsImages: true,
    supportsVideos: true,
    supportsAudio: true,
    maxImages: 9,
    maxVideos: 3,
    maxAudio: 3,
    minDuration: 4,
    maxDuration: 15,
    aspectRatios: ["auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
    resolutions: ["480p", "720p"],
    requiredAsset: "any-visual",
    promptTemplateType: "reference-to-video",
    pricingNote: "Pricing per fal.ai — assumed to match Seedance 2.0's parameter shape (unconfirmed); confirm current rate and limits before use.",
    status: "enabled",
  },
  {
    id: "kling-o1-video-to-video-edit",
    label: "Kling O1 Video-to-Video Edit",
    falEndpoint: "fal-ai/kling-video/o1/video-to-video/edit",
    category: "video-edit",
    supportsImages: false,
    supportsVideos: true,
    supportsAudio: false,
    maxImages: 0,
    maxVideos: 1,
    maxAudio: 0,
    minDuration: 2,
    maxDuration: 10,
    aspectRatios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p"],
    requiredAsset: "video",
    promptTemplateType: "video-edit",
    pricingNote: "Experimental — no working adapter yet; endpoint ID confirmed against the installed SDK, but schema not checked against fal.ai's docs.",
    status: "experimental",
  },
  {
    id: "kling-o3-4k-video-to-video-reference",
    label: "Kling O3 4K Video-to-Video (Reference)",
    falEndpoint: "fal-ai/kling-video/o3/4k/video-to-video/reference",
    category: "video-edit",
    supportsImages: true,
    supportsVideos: true,
    supportsAudio: false,
    maxImages: 4,
    maxVideos: 1,
    maxAudio: 0,
    minDuration: 3,
    maxDuration: 15,
    aspectRatios: ["auto", "16:9", "9:16", "1:1"],
    resolutions: [],
    requiredAsset: "video",
    promptTemplateType: "video-edit",
    pricingNote:
      "Native 4K output in one step. Requires one source video (3-15s, 720-3840px, max 200MB); up to 4 style/appearance images. Preserves the source video's own audio (keep_audio) rather than accepting a separate audio upload.",
    status: "enabled",
  },
  {
    id: "kling-o3-pro-video-to-video-edit",
    label: "Kling O3 Edit Video (Pro) Video-to-Video",
    falEndpoint: "fal-ai/kling-video/o3/pro/video-to-video/edit",
    category: "video-edit",
    supportsImages: true,
    supportsVideos: true,
    supportsAudio: false,
    maxImages: 4,
    maxVideos: 1,
    maxAudio: 0,
    minDuration: 3,
    maxDuration: 15,
    aspectRatios: [],
    resolutions: [],
    requiredAsset: "video",
    promptTemplateType: "video-edit",
    pricingNote:
      "Requires one source video (3-15s, 720-3840px, max 200MB); up to 4 style/appearance images. Output duration and aspect ratio follow the source video — this endpoint has no duration/aspect_ratio parameter to set.",
    status: "enabled",
  },
  {
    id: "kling-v3-pro-image-to-video",
    label: "Kling v3 Pro Image-to-Video",
    falEndpoint: "fal-ai/kling-video/v3/pro/image-to-video",
    category: "image-to-video",
    supportsImages: true,
    supportsVideos: false,
    supportsAudio: false,
    maxImages: 2,
    maxVideos: 0,
    maxAudio: 0,
    minDuration: 3,
    maxDuration: 15,
    aspectRatios: [],
    resolutions: [],
    requiredAsset: "image",
    promptTemplateType: "image-to-video",
    pricingNote:
      "Cinematic image-to-video with native audio generation. The first uploaded image is the starting frame; a second (optional) becomes the end frame. Generates its own native audio (generate_audio) rather than accepting an audio upload. No resolution or aspect_ratio parameter.",
    status: "enabled",
  },
];

export function getModelById(id: string): FalVideoModel | undefined {
  return FAL_VIDEO_MODELS.find((model) => model.id === id);
}
