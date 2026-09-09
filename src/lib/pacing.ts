// Target speaking pace for generated ad scripts: 130-150 words per minute,
// i.e. 2.17-2.50 words per second.
export const TARGET_WPM_MIN = 130;
export const TARGET_WPM_MAX = 150;

export function calculateTargetWordCountRange(targetDurationSeconds: number): {
  min: number;
  max: number;
} {
  return {
    min: Math.round(targetDurationSeconds * 2.17),
    max: Math.round(targetDurationSeconds * 2.5),
  };
}
