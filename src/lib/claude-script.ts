import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "./anthropic";

const MODEL = "claude-opus-5";

export class MissingApiKeyError extends Error {}

export async function generateScriptText(system: string, user: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new MissingApiKeyError("ANTHROPIC_API_KEY is not set.");
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    output_config: { effort: "medium" },
    system,
    messages: [{ role: "user", content: user }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return a text response.");
  }
  return textBlock.text;
}

export function claudeErrorResponse(error: unknown): { status: number; error: string } {
  if (error instanceof MissingApiKeyError || error instanceof Anthropic.AuthenticationError) {
    return {
      status: 500,
      error: "Server is not configured with a valid ANTHROPIC_API_KEY.",
    };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return { status: 429, error: "Rate limited by the Claude API. Try again shortly." };
  }
  if (error instanceof Anthropic.BadRequestError) {
    return { status: 400, error: `Claude API rejected the request: ${error.message}` };
  }
  if (error instanceof Anthropic.APIError) {
    return { status: 502, error: `Claude API error: ${error.message}` };
  }
  return {
    status: 500,
    error: error instanceof Error ? error.message : "Unknown server error.",
  };
}
