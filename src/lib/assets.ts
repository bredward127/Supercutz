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
