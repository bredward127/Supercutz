import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Reads ANTHROPIC_API_KEY from the server environment. Never import this
// file from a Client Component — the `server-only` guard above makes any
// such import fail at build time.
export const anthropic = new Anthropic();
