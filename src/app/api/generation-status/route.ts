import "server-only";
import { assertFalKeyConfigured, fal, falErrorResponse } from "@/lib/fal";
import { getModelById } from "@/lib/models";

export const maxDuration = 30;

function extractVideoUrl(data: unknown): string | null {
  if (typeof data !== "object" || data === null) return null;
  const video = (data as { video?: unknown }).video;
  if (typeof video !== "object" || video === null) return null;
  const url = (video as { url?: unknown }).url;
  return typeof url === "string" ? url : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestId = url.searchParams.get("requestId");
  const modelId = url.searchParams.get("modelId");

  if (!requestId || !modelId) {
    return Response.json({ error: "Expected requestId and modelId query params." }, { status: 400 });
  }

  const model = getModelById(modelId);
  if (!model) {
    return Response.json({ error: `Unknown model id: ${modelId}` }, { status: 400 });
  }

  try {
    assertFalKeyConfigured();
    const status = await fal.queue.status(model.falEndpoint, { requestId, logs: true });

    if (status.status === "IN_QUEUE") {
      return Response.json({ state: "queued", queuePosition: status.queue_position });
    }

    if (status.status === "IN_PROGRESS") {
      return Response.json({ state: "in-progress", logs: status.logs.map((log) => log.message) });
    }

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result(model.falEndpoint, { requestId });
      const videoUrl = extractVideoUrl(result.data);
      if (!videoUrl) {
        return Response.json(
          { state: "failed", error: "Generation completed but no video URL was found in the result." },
          { status: 502 }
        );
      }
      return Response.json({ state: "completed", videoUrl });
    }

    // Defensive fallback: the installed SDK's QueueStatus union only
    // enumerates IN_QUEUE/IN_PROGRESS/COMPLETED, but the live API may report
    // other values (e.g. a literal FAILED) that this client version doesn't
    // type — treat anything unrecognized as failed rather than crashing.
    return Response.json(
      { state: "failed", error: `Unrecognized status from fal.ai: ${(status as { status: string }).status}` },
      { status: 502 }
    );
  } catch (error) {
    const { status: httpStatus, error: message } = falErrorResponse(error);
    return Response.json({ state: "failed", error: message }, { status: httpStatus });
  }
}
