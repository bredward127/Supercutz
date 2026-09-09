// Request/response contracts shared between the script API routes and the
// client-side ScriptPanel that calls them.

export interface CampaignContext {
  campaignType: string;
  offer: string;
  cta: string;
  audience: string;
  tone: string;
  targetDurationSeconds: number;
  availableAssetLabels: string[];
}

export type GenerateScriptRequest = CampaignContext;

export interface ReformatTranscriptRequest extends CampaignContext {
  rawTranscript: string;
}

export interface ResizeScriptRequest {
  script: string;
  targetDurationSeconds: number;
}

export interface ScriptApiSuccessResponse {
  script: string;
}

export interface ScriptApiErrorResponse {
  error: string;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function parseCampaignContext(body: Record<string, unknown>): CampaignContext | null {
  if (
    typeof body.campaignType !== "string" ||
    typeof body.offer !== "string" ||
    typeof body.cta !== "string" ||
    typeof body.audience !== "string" ||
    typeof body.tone !== "string" ||
    typeof body.targetDurationSeconds !== "number" ||
    !Number.isFinite(body.targetDurationSeconds) ||
    body.targetDurationSeconds <= 0 ||
    !isStringArray(body.availableAssetLabels)
  ) {
    return null;
  }

  return {
    campaignType: body.campaignType,
    offer: body.offer,
    cta: body.cta,
    audience: body.audience,
    tone: body.tone,
    targetDurationSeconds: body.targetDurationSeconds,
    availableAssetLabels: body.availableAssetLabels,
  };
}

export function parseResizeScriptRequest(body: Record<string, unknown>): ResizeScriptRequest | null {
  if (
    typeof body.script !== "string" ||
    body.script.trim().length === 0 ||
    typeof body.targetDurationSeconds !== "number" ||
    !Number.isFinite(body.targetDurationSeconds) ||
    body.targetDurationSeconds <= 0
  ) {
    return null;
  }

  return { script: body.script, targetDurationSeconds: body.targetDurationSeconds };
}
