// Response contract for GET /api/generation-status, shared between the
// route and the client-side GenerationPanel that polls it.

export type GenerationState = "queued" | "in-progress" | "completed" | "failed";

export interface GenerationStatusResponse {
  state: GenerationState;
  queuePosition?: number;
  logs?: string[];
  videoUrl?: string;
  error?: string;
}
