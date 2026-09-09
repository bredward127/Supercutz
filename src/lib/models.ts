// Registry of fal.ai video models available to the app. This file is data
// only — UI components read from it, they don't branch on model names.
//
// Seedance 2.0 / 2.0 Fast / 2.5 Reference-to-Video (the three models with a
// working adapter as of the generate-video route): supportsImages/Videos/Audio,
// maxImages/Videos/Audio, minDuration/maxDuration, and resolutions below are
// verified against the actual input schema shipped in @fal-ai/client's type
// definitions (Seedance2R2VInput) — max 9 images, max 3 videos (combined
// duration 2-15s), max 3 audio files (combined duration <=15s), duration 4-15s,
// resolutions 480p/720p. The `falEndpoint` path strings for these three are
// NOT verified: the installed SDK's endpoint map only registers Seedance
// v1/v1.5 paths, not v2 — v2's Input/Output types exist but no endpoint ID
// string is published there yet. The paths below follow the same naming
// convention as the confirmed v1/v1.5 endpoints; confirm the exact string in
// the fal.ai dashboard before spending real generation credits, and note that
// 2.5 is assumed (not confirmed) to share 2.0's parameter shape.
//
// The remaining models (Kling, Happy Horse) are experimental placeholders —
// nothing about them is verified and no adapter exists for them yet.

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
  aspectRatios: string[];
  resolutions: string[];
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
    promptTemplateType: "video-edit",
    pricingNote: "Experimental — no working adapter yet; specs unverified.",
    status: "experimental",
  },
  {
    id: "kling-o3-video-to-video-edit",
    label: "Kling O3 Video-to-Video Edit",
    falEndpoint: "fal-ai/kling-video/o3/video-to-video/edit",
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
    resolutions: ["720p", "1080p"],
    promptTemplateType: "video-edit",
    pricingNote: "Experimental — no working adapter yet; specs unverified.",
    status: "experimental",
  },
  {
    id: "happy-horse-video-edit",
    label: "Happy Horse Video Edit",
    falEndpoint: "fal-ai/happy-horse/video-edit",
    category: "video-edit",
    supportsImages: false,
    supportsVideos: true,
    supportsAudio: false,
    maxImages: 0,
    maxVideos: 1,
    maxAudio: 0,
    minDuration: 2,
    maxDuration: 10,
    aspectRatios: ["16:9", "9:16"],
    resolutions: ["720p"],
    promptTemplateType: "video-edit",
    pricingNote: "Experimental — no working adapter yet; specs unverified.",
    status: "experimental",
  },
  {
    id: "kling-o3-image-to-video",
    label: "Kling O3 Image-to-Video",
    falEndpoint: "fal-ai/kling-video/o3/image-to-video",
    category: "image-to-video",
    supportsImages: true,
    supportsVideos: false,
    supportsAudio: false,
    maxImages: 1,
    maxVideos: 0,
    maxAudio: 0,
    minDuration: 5,
    maxDuration: 10,
    aspectRatios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
    promptTemplateType: "image-to-video",
    pricingNote: "Experimental — no working adapter yet; specs unverified.",
    status: "experimental",
  },
];

export function getModelById(id: string): FalVideoModel | undefined {
  return FAL_VIDEO_MODELS.find((model) => model.id === id);
}
