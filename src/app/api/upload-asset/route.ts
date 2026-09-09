import "server-only";
import { assertFalKeyConfigured, fal, falErrorResponse } from "@/lib/fal";

// Uploads can involve real video files; give fal's storage service room.
export const maxDuration = 60;

// Approach: the browser posts the raw file to this route as multipart form
// data; this route calls fal.storage.upload() *server-side* and returns the
// resulting fal-hosted URL. This is fal's own supported method for getting
// local files in front of its models (rather than us standing up our own
// temporary file host) — FAL_KEY never leaves the server, and the browser
// never talks to fal.ai directly.
//
// Known limitation: the file bytes pass through this Next.js route handler,
// so on Vercel they're subject to the platform's serverless function request
// body size limit (4.5 MB by default). Real source videos can exceed that —
// if uploads start failing on size once this is wired to the UI, the fix is
// a direct-to-storage flow instead of routing bytes through here.
export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json(
      { error: "Expected multipart/form-data with a 'file' field." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return Response.json({ error: "Missing 'file' field." }, { status: 400 });
  }

  try {
    assertFalKeyConfigured();
    const url = await fal.storage.upload(file);
    return Response.json({ url });
  } catch (error) {
    const { status, error: message } = falErrorResponse(error);
    return Response.json({ error: message }, { status });
  }
}
