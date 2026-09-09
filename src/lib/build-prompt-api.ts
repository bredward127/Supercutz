// Request/response contract for POST /api/build-prompt, shared between the
// route and the client-side ScriptPanel that calls it.

export interface BuildPromptRequest {
  modelId: string;
  campaignType: string;
  targetDurationSeconds: number;
  aspectRatio: string;
  environmentDescription: string;
  objectReplacementDescription: string;
  productionScript: string;
  // Ordered list of asset roles (e.g. "source_video", "logo",
  // "product_image") — see src/lib/asset-roles.ts for the vocabulary.
  assetRoles: string[];
}

export interface BuildPromptResponse {
  prompt: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseBuildPromptRequest(body: Record<string, unknown>): BuildPromptRequest | null {
  if (
    typeof body.modelId !== "string" ||
    body.modelId.trim().length === 0 ||
    typeof body.campaignType !== "string" ||
    typeof body.targetDurationSeconds !== "number" ||
    !Number.isFinite(body.targetDurationSeconds) ||
    body.targetDurationSeconds <= 0 ||
    typeof body.aspectRatio !== "string" ||
    body.aspectRatio.trim().length === 0 ||
    typeof body.environmentDescription !== "string" ||
    typeof body.objectReplacementDescription !== "string" ||
    typeof body.productionScript !== "string" ||
    body.productionScript.trim().length === 0 ||
    !isStringArray(body.assetRoles)
  ) {
    return null;
  }

  return {
    modelId: body.modelId,
    campaignType: body.campaignType,
    targetDurationSeconds: body.targetDurationSeconds,
    aspectRatio: body.aspectRatio,
    environmentDescription: body.environmentDescription,
    objectReplacementDescription: body.objectReplacementDescription,
    productionScript: body.productionScript,
    assetRoles: body.assetRoles,
  };
}
