import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { upsertSupabaseUser, getSupabaseUser } from "@/app/lib/supabaseTokenStore";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  console.log("__________________________Middleware Event________________________", "\n");

  const zoomHeader = request.headers.get("x-zoom-app-context");
  // 🔐 Extract tokens from query string
  // Manually decode tokens from malformed query string
  let access_token = url.searchParams.get("access_token");
  let refresh_token = url.searchParams.get("refresh_token");
  let state = url.searchParams.get("state");


  // Try fallback if not found normally
  if (!access_token || !refresh_token) {
    const rawSearch = url.search; // includes the '?'
    console.log("Raw search params:", rawSearch, "\n");
    console.log("__________________________________________________", "\n");
    const decodedSearch = decodeURIComponent(rawSearch);
    const fragmentParams = new URLSearchParams(decodedSearch.replace(/^\?/, ""));

    access_token = access_token || fragmentParams.get("access_token") || fragmentParams.get("#access_token") || fragmentParams.get("%23access_token");
    refresh_token = refresh_token || fragmentParams.get("refresh_token");
  }

  if (access_token && refresh_token ) {

    console.log("🪪  MD - Access token:", access_token, "\n");
    console.log("🔁  MD - Refresh token:", refresh_token, "\n");
    console.log("🔑  MD - State:", state, "\n");
    
    // Store tokens in Redis
    console.log("Storing tokens in Redis...");

    // Insert or update Supabase tokens
    await upsertSupabaseUser(state, access_token, refresh_token, Date.now() + 3600 * 1000);
    console.log("✅  Middle Ware: Tokens stored in Redis");

    // Clean up tokens and redirect
    url.searchParams.delete("access_token");
    url.searchParams.delete("refresh_token");
    url.pathname = "/dashboard";

    return NextResponse.redirect(url);

  } else {
    console.log("❌ No tokens found in query params.");
  }


  const response = await updateSession(request);

  if (zoomHeader) {
    console.log("______________________________Middleware Event____________________________", "\n");
    console.log(`📬  Zoom sent an HTTP request to the App Home URL: \n\n${zoomHeader}`, "\n");
    console.log("____________________________End Of Middleware Event__________________________", "\n");
  } else {
    console.log("🕵️‍♂️  Middleware: No x-zoom-app-context header present.", '\n');
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
