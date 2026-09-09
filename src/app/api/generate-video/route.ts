import "server-only";
import { assertFalKeyConfigured, fal, falErrorResponse } from "@/lib/fal";
import {
  buildKlingO3FourKReferenceInput,
  buildKlingO3ProEditInput,
  buildKlingV3ProImageToVideoInput,
} from "@/lib/fal-kling";
import { buildSeedanceReferenceToVideoInput } from "@/lib/fal-seedance";
import {
  isSupportedGenerateVideoModelId,
  parseGenerateVideoRequest,
  SUPPORTED_GENERATE_VIDEO_MODEL_IDS,
  validateAgainstModel,
  type GenerateVideoRequest,
  type SupportedGenerateVideoModelId,
} from "@/lib/generate-video-api";
import { getModelById } from "@/lib/models";

export const maxDuration = 60;

// Dispatches to the per-model adapter that maps our generic request shape
// to the specific fal.ai model's input schema. Seedance's three variants
// share one adapter (same input shape); each Kling model has its own,
// since Kling's video-edit and image-to-video models take fundamentally
// different fields (see src/lib/fal-kling.ts).
function buildFalInput(input: GenerateVideoRequest, modelId: SupportedGenerateVideoModelId): Record<string, unknown> {
  switch (modelId) {
    case "kling-o3-4k-video-to-video-reference":
      return buildKlingO3FourKReferenceInput(input);
    case "kling-o3-pro-video-to-video-edit":
      return buildKlingO3ProEditInput(input);
    case "kling-v3-pro-image-to-video":
      return buildKlingV3ProImageToVideoInput(input);
    case "seedance-2-5-reference-to-video":
      return buildSeedanceReferenceToVideoInput(input);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseGenerateVideoRequest(body as Record<string, unknown>);
  if (!input) {
    return Response.json(
      {
        error:
          "Expected modelId, prompt, aspectRatio (non-empty strings), resolution (string, may be empty for models without a resolution parameter), durationSeconds (positive number), and assetUrls: { images, videos, audio } (string arrays).",
      },
      { status: 400 }
    );
  }

  if (!isSupportedGenerateVideoModelId(input.modelId)) {
    return Response.json(
      {
        error: `Model "${input.modelId}" has no generation adapter yet. Supported models: ${SUPPORTED_GENERATE_VIDEO_MODEL_IDS.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  const model = getModelById(input.modelId);
  if (!model) {
    return Response.json({ error: `Unknown model id: ${input.modelId}` }, { status: 400 });
  }

  const violations = validateAgainstModel(input, model);
  if (violations.length > 0) {
    return Response.json({ error: violations.join(" ") }, { status: 400 });
  }

  try {
    assertFalKeyConfigured();
    const falInput = buildFalInput(input, input.modelId);
    const queueStatus = await fal.queue.submit(model.falEndpoint, { input: falInput });
    return Response.json({
      requestId: queueStatus.request_id,
      status: "queued",
      queuePosition: queueStatus.queue_position,
    });
  } catch (error) {
    const { status, error: message } = falErrorResponse(error);
    return Response.json({ error: message }, { status });
  }
}
