import type { NextRequest } from "next/server";

// Gates every request (page + all /api/* routes, since those are what
// actually spend ANTHROPIC_API_KEY/FAL_KEY credits) behind a single shared
// password via HTTP Basic Auth. The browser's native credential prompt
// handles storage/caching, so no login page or cookie logic is needed.
//
// Fails closed: if SITE_PASSWORD isn't set, every request — including the
// owner's — is denied, rather than left wide open. That way forgetting to
// configure it in Vercel locks you out instead of leaving the app public.
export function proxy(request: NextRequest): Response | undefined {
  const expectedPassword = process.env.SITE_PASSWORD;
  if (!expectedPassword) {
    return new Response("SITE_PASSWORD is not configured on the server.", { status: 401 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const encoded = authHeader.slice("Basic ".length);
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (password === expectedPassword) {
      return undefined;
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Supercutz"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
