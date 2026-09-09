import "server-only";
import { claudeErrorResponse, generateScriptText } from "@/lib/claude-script";
import { buildGenerateScriptPrompt } from "@/lib/prompts";
import { parseCampaignContext } from "@/lib/script-api";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseCampaignContext(body as Record<string, unknown>);
  if (!input) {
    return Response.json(
      {
        error:
          "Expected campaignType, offer, cta, audience, tone (strings), targetDurationSeconds (positive number), and availableAssetLabels (string array).",
      },
      { status: 400 }
    );
  }

  try {
    const { system, user } = buildGenerateScriptPrompt(input);
    const script = await generateScriptText(system, user);
    return Response.json({ script });
  } catch (error) {
    const { status, error: message } = claudeErrorResponse(error);
    return Response.json({ error: message }, { status });
  }
}
