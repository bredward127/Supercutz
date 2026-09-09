import "server-only";
import { claudeErrorResponse, generateScriptText } from "@/lib/claude-script";
import { buildReformatTranscriptPrompt } from "@/lib/prompts";
import { parseCampaignContext, type ReformatTranscriptRequest } from "@/lib/script-api";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const context = parseCampaignContext(record);
  const rawTranscript = record.rawTranscript;

  if (!context || typeof rawTranscript !== "string" || rawTranscript.trim().length === 0) {
    return Response.json(
      {
        error:
          "Expected rawTranscript (non-empty string) plus campaignType, offer, cta, audience, tone (strings), targetDurationSeconds (positive number), and availableAssetLabels (string array).",
      },
      { status: 400 }
    );
  }

  const input: ReformatTranscriptRequest = { ...context, rawTranscript };

  try {
    const { system, user } = buildReformatTranscriptPrompt(input);
    const script = await generateScriptText(system, user);
    return Response.json({ script });
  } catch (error) {
    const { status, error: message } = claudeErrorResponse(error);
    return Response.json({ error: message }, { status });
  }
}
