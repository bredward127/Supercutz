// Registry of fal.ai video models available to the app. This file is data
// only — UI components read from it, they don't branch on model names.
//
// Seedance 2.5 Reference-to-Video is verified against fal.ai's own published
// Node.js API docs (bytedance/seedance-2.5/reference-to-video — note: no
// fal-ai/ prefix, since ByteDance hosts this model directly under its own
// namespace rather than fal-ai/'s). Seedance 2.0 and 2.0 Fast are
// experimental placeholders: their falEndpoint strings were a
// naming-convention guess (following the pattern of confirmed Seedance
// v1/v1.5 endpoints in the installed @fal-ai/client SDK, since v2 isn't
// registered there), and that same guessing method produced a confirmed-404
// wrong string for 2.5 in production — so treat 2.0/2.0 Fast as wrong too
// until their real docs are checked the same way 2.5's were.
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
  // undefined means no known cap. Kling enforces a hard 2500-character
  // limit on `prompt` server-side (confirmed by a live "String should have
  // at most 2500 characters" rejection on the O3 endpoints, and stated
  // directly in fal's docs for several of Kling's other request variants) —
  // this app's deterministic build-prompt template can easily exceed that
  // for a detailed script, so it's worth catching before submission.
  maxPromptLength?: number;
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
    pricingNote:
      "Experimental — this endpoint string was a naming-convention guess, and the same guessing method produced the confirmed-wrong Seedance 2.5 string below (a live 404), so treat this one as wrong too until verified against fal.ai's own docs.",
    status: "experimental",
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
    pricingNote:
      "Experimental — this endpoint string was a naming-convention guess, and the same guessing method produced the confirmed-wrong Seedance 2.5 string below (a live 404), so treat this one as wrong too until verified against fal.ai's own docs.",
    status: "experimental",
  },
  {
    id: "seedance-2-5-reference-to-video",
    label: "Seedance 2.5 Reference-to-Video",
    falEndpoint: "bytedance/seedance-2.5/reference-to-video",
    category: "reference-to-video",
    supportsImages: true,
    supportsVideos: true,
    supportsAudio: true,
    maxImages: 30,
    maxVideos: 10,
    maxAudio: 10,
    minDuration: 4,
    maxDuration: 30,
    aspectRatios: ["auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
    resolutions: ["480p", "720p", "1080p"],
    requiredAsset: "any-visual",
    promptTemplateType: "reference-to-video",
    pricingNote:
      "Verified against fal.ai's own published Node.js API docs. Note the real endpoint has no fal-ai/ prefix — bytedance hosts this model directly under its own namespace, unlike Kling's fal-ai/kling-video/... paths. Up to 30 images (max 30MB each), 10 videos (each 1.8-30.2s, max 200MB, combined ≤30.2s), 10 audio files (each 1.8-30.2s, max 15MB, combined ≤30.2s) — at least one image or video reference is required. Also supports a native `generate_audio` toggle, a `bitrate_mode`, and a `seed` for reproducibility; this app doesn't expose the latter two in its UI.",
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
    maxPromptLength: 2500,
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
    maxPromptLength: 2500,
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
    maxPromptLength: 2500,
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
