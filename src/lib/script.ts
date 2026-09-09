// Duration and aspect ratio options for the script/generation controls.
// Data only — kept independent of the fal model registry for now, since
// nothing here is validated against a selected model's supported ranges yet.

export const DURATION_PRESETS = [6, 10, 15, 30, 45, 60] as const;
export type DurationPreset = (typeof DURATION_PRESETS)[number];
export type DurationSelection = DurationPreset | "custom";

export const ASPECT_RATIO_OPTIONS = ["9:16", "1:1", "16:9", "4:5"] as const;
export type AspectRatio = (typeof ASPECT_RATIO_OPTIONS)[number];
