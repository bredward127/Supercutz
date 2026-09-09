import "server-only";
import { ApiError, fal, ValidationError } from "@fal-ai/client";

// Reads FAL_KEY from the server environment (the client auto-detects it via
// process.env — see @fal-ai/client's config.ts). Never import this file from
// a Client Component — the `server-only` guard above makes any such import
// fail at build time.
export { fal };

export class MissingFalKeyError extends Error {}

export function assertFalKeyConfigured(): void {
  if (!process.env.FAL_KEY) {
    throw new MissingFalKeyError("FAL_KEY is not set.");
  }
}

export function falErrorResponse(error: unknown): { status: number; error: string } {
  if (error instanceof MissingFalKeyError) {
    return { status: 500, error: "Server is not configured with a valid FAL_KEY." };
  }
  if (error instanceof ValidationError) {
    const details = error.fieldErrors.map((field) => `${field.loc.join(".")}: ${field.msg}`).join("; ");
    return { status: 400, error: `fal.ai rejected the request: ${details || error.message}` };
  }
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return { status: 500, error: "Server is not configured with a valid FAL_KEY." };
    }
    return { status: error.status >= 500 ? 502 : error.status, error: `fal.ai error: ${error.message}` };
  }
  return {
    status: 500,
    error: error instanceof Error ? error.message : "Unknown server error.",
  };
}
