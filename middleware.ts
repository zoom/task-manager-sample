import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { upsertSupabaseUser } from "@/app/lib/token-store";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const zoomHeader = request.headers.get("x-zoom-app-context");

  if (zoomHeader) {
    console.log("__________________________Middleware Event________________________\n");
    console.log("📬  Zoom x-zoom-app-context Header:\n", zoomHeader, "\n");
  }

  // Extract query parameters
  let access_token = url.searchParams.get("access_token");
  let refresh_token = url.searchParams.get("refresh_token");
  const state = url.searchParams.get("state") || "unknown";

  if (!access_token || !refresh_token) {
    const rawSearch = url.search;
    const decodedSearch = decodeURIComponent(rawSearch.replace(/^\?/, ""));
    const fragmentParams = new URLSearchParams(decodedSearch);

    access_token = access_token || fragmentParams.get("access_token") || fragmentParams.get("#access_token") || fragmentParams.get("%23access_token");
    refresh_token = refresh_token || fragmentParams.get("refresh_token");
  }

  if (access_token && refresh_token) {
    console.log('\n', "🪪  MW - Access token:", access_token);
    console.log("🔁  MW - Refresh token:", refresh_token);
    console.log("🔑  MW - State:", state, "\n");

    try {
      // Store tokens in Redis with a TTL of 1 hour from now
      const expiresAt = Date.now() + 3600 * 1000;
      await upsertSupabaseUser(state, access_token, refresh_token, expiresAt);
      console.log("✅ Middleware: Tokens stored in Redis - state: ", state, "\n");
    } catch (error) {
      console.error("❌ Middleware: Failed to store tokens in Redis:", error);
    }

    // Clean up tokens from URL and redirect
    url.searchParams.delete("access_token");
    url.searchParams.delete("refresh_token");
    url.pathname = "/dashboard";

    return NextResponse.redirect(url);
  }
  // Continue normal Supabase session logic
  const response = await updateSession(request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
