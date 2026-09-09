import "server-only";
import { claudeErrorResponse, generateScriptText } from "@/lib/claude-script";
import { buildResizeScriptPrompt } from "@/lib/prompts";
import { parseResizeScriptRequest } from "@/lib/script-api";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseResizeScriptRequest(body as Record<string, unknown>);
  if (!input) {
    return Response.json(
      { error: "Expected script (non-empty string) and targetDurationSeconds (positive number)." },
      { status: 400 }
    );
  }

  try {
    const { system, user } = buildResizeScriptPrompt(input);
    const script = await generateScriptText(system, user);
    return Response.json({ script });
  } catch (error) {
    const { status, error: message } = claudeErrorResponse(error);
    return Response.json({ error: message }, { status });
  }
}
