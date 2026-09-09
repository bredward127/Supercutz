// Registry of fal.ai video models available to the app. This file is data
// only — UI components read from it, they don't branch on model names.
//
// Endpoint strings, durations, resolutions, and aspect ratios below are
// best-guess placeholders following fal.ai's usual naming/parameter
// conventions. Nothing here has been verified against fal.ai's live model
// catalog yet — confirm every field against the real docs before wiring up
// actual API calls in a later stage.

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
    supportsAudio: false,
    maxImages: 4,
    maxVideos: 1,
    maxAudio: 0,
    minDuration: 5,
    maxDuration: 10,
    aspectRatios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
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
    supportsAudio: false,
    maxImages: 4,
    maxVideos: 1,
    maxAudio: 0,
    minDuration: 5,
    maxDuration: 10,
    aspectRatios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p"],
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
    supportsAudio: false,
    maxImages: 4,
    maxVideos: 1,
    maxAudio: 0,
    minDuration: 5,
    maxDuration: 12,
    aspectRatios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
    promptTemplateType: "reference-to-video",
    pricingNote: "Pricing per fal.ai — confirm current rate before use.",
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
