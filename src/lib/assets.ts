// What role an uploaded image plays in the generation prompt. Data only —
// components read from IMAGE_ROLE_OPTIONS rather than hardcoding the list.

export type ImageRole =
  | "logo"
  | "product"
  | "app-screenshot"
  | "environment-reference"
  | "other";

export const IMAGE_ROLE_OPTIONS: { value: ImageRole; label: string }[] = [
  { value: "logo", label: "Logo" },
  { value: "product", label: "Product" },
  { value: "app-screenshot", label: "App screenshot" },
  { value: "environment-reference", label: "Environment reference" },
  { value: "other", label: "Other" },
];

export interface ImageAsset {
  id: string;
  file: File;
  role: ImageRole;
}

// Maps AssetsPanel's ImageRole values to the wire-format role vocabulary
// the build-prompt API expects (see src/lib/asset-roles.ts).
const IMAGE_ROLE_TO_ASSET_ROLE: Record<ImageRole, string> = {
  logo: "logo",
  product: "product_image",
  "app-screenshot": "app_screenshot",
  "environment-reference": "environment_reference",
  other: "other_image",
};

export interface AssetsSummary {
  hasSourceVideo: boolean;
  hasStyleVideo: boolean;
  hasAudio: boolean;
  // Ordered, one entry per uploaded image — duplicates allowed, since each
  // image gets its own @ImageN reference regardless of shared roles.
  imageRoles: ImageRole[];
}

// Ordered list of wire-format asset roles (source_video, style_video, one
// entry per image, then voice_audio), matching upload order within each
// asset type — this is what the build-prompt route numbers @ImageN/@VideoN/
// @AudioN from.
export function buildAssetRoleList(summary: AssetsSummary): string[] {
  const roles: string[] = [];
  if (summary.hasSourceVideo) roles.push("source_video");
  if (summary.hasStyleVideo) roles.push("style_video");
  for (const role of summary.imageRoles) {
    roles.push(IMAGE_ROLE_TO_ASSET_ROLE[role]);
  }
  if (summary.hasAudio) roles.push("voice_audio");
  return roles;
}
