import "server-only";
import { assertFalKeyConfigured, fal, falErrorResponse } from "@/lib/fal";
import { buildSeedanceReferenceToVideoInput } from "@/lib/fal-seedance";
import {
  isSupportedGenerateVideoModelId,
  parseGenerateVideoRequest,
  SUPPORTED_GENERATE_VIDEO_MODEL_IDS,
  validateAgainstModel,
} from "@/lib/generate-video-api";
import { getModelById } from "@/lib/models";

export const maxDuration = 60;

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
          "Expected modelId, prompt, resolution, aspectRatio (non-empty strings), durationSeconds (positive number), and assetUrls: { images, videos, audio } (string arrays).",
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
    const falInput = buildSeedanceReferenceToVideoInput(input);
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
