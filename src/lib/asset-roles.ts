// Canonical asset role vocabulary used on the wire between the client
// (Assets -> Script -> build-prompt wiring) and the build-prompt API route.
// Data only — the route's categorization logic reads from this table
// instead of hardcoding role names.

export type AssetCategory = "video" | "image" | "audio";

export interface AssetRoleInfo {
  category: AssetCategory;
  label: string;
  description: string;
}

export const ASSET_ROLE_INFO: Record<string, AssetRoleInfo> = {
  source_video: {
    category: "video",
    label: "Source video",
    description:
      "The presenter's original footage; identity, voice, and delivery must be preserved.",
  },
  style_video: {
    category: "video",
    label: "Style/reference video",
    description:
      "Visual style and pacing reference only — do not carry over its subject or audio.",
  },
  logo: {
    category: "image",
    label: "Logo",
    description: "Brand mark; must remain pixel-accurate wherever it appears.",
  },
  product_image: {
    category: "image",
    label: "Product image",
    description: "Reference for how the product should look.",
  },
  app_screenshot: {
    category: "image",
    label: "App screenshot",
    description: "Reference UI to depict on screen.",
  },
  environment_reference: {
    category: "image",
    label: "Environment reference",
    description: "Reference for the setting or background.",
  },
  other_image: {
    category: "image",
    label: "Other image",
    description: "Supplementary visual reference.",
  },
  voice_audio: {
    category: "audio",
    label: "Voice-over reference",
    description: "Reference voice-over audio; match tone and pacing.",
  },
};

function titleCase(role: string): string {
  return role.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

// Falls back to a generic entry for any role string not in the table above,
// so the route stays robust if new roles show up before this table is updated.
export function categorizeAssetRole(role: string): AssetRoleInfo {
  const known = ASSET_ROLE_INFO[role];
  if (known) return known;

  const normalized = role.toLowerCase();
  const category: AssetCategory = normalized.includes("video")
    ? "video"
    : normalized.includes("audio")
      ? "audio"
      : "image";

  return { category, label: titleCase(role), description: "Supplementary reference asset." };
}
