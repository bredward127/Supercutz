import { parseBuildPromptRequest } from "@/lib/build-prompt-api";
import { getModelById } from "@/lib/models";
import { buildModelPrompt } from "@/lib/prompt-builder";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseBuildPromptRequest(body as Record<string, unknown>);
  if (!input) {
    return Response.json(
      {
        error:
          "Expected modelId, aspectRatio, productionScript (non-empty strings), campaignType, environmentDescription, objectReplacementDescription (strings), targetDurationSeconds (positive number), and assetRoles (string array).",
      },
      { status: 400 }
    );
  }

  const model = getModelById(input.modelId);
  if (!model) {
    return Response.json({ error: `Unknown model id: ${input.modelId}` }, { status: 400 });
  }

  const prompt = buildModelPrompt(input, model);
  return Response.json({ prompt });
}
