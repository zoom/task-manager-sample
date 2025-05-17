import { type NextRequest, NextResponse } from "next/server";
import { decryptZoomAppContext } from "@/app/lib/zoom-helper";
import { updateSession } from "@/utils/supabase/middleware";
import { upsertSupabaseUser, getSupabaseUser } from "@/app/lib/supabaseTokenStore";

export async function GET(request: NextRequest) {
  console.log("__________________________Zoom Home Page Get Route________________________", "\n");
  const response = await updateSession(request);
  const { searchParams, origin } = new URL(request.url);
  const url = request.url;
  const zoomHeader = request.headers.get("x-zoom-app-context");

  // Should get from the params instead of hardcoding
  //const userId = "tlMA8OtuQX-UjUoIN1k0qQ"; // TODO: Make dynamic
  const userId = "TIA5UgoMte"

  const access_token = extractToken("access_token", searchParams, url);
  const refresh_token = extractToken("refresh_token", searchParams, url);

  logRequest(request.url, zoomHeader, searchParams);

  if (access_token && refresh_token) {

    // await upsertSupabaseUser(userId, access_token, refresh_token, Date.now() + 3600 * 1000);
    // console.log("✅ Tokens stored in Redis");

    return NextResponse.json({ success: true });

  } else {
    console.warn("⚠️ Missing access_token or refresh_token");
  }

  const parsedAction = handleZoomContext(zoomHeader);

  // Handle API mode from client request (no redirect)
  if (parsedAction.verified === "getToken") {
    try {
      const tokenData = await getSupabaseUser(userId);
      console.log("🔐 Token retrieved from Redis:", tokenData);

      const redirectUrl = new URL("https://donte.ngrok.io");
      // redirectUrl.searchParams.set("access_token", tokenData.accessToken);
      // redirectUrl.searchParams.set("refresh_token", tokenData.refreshToken);

      console.log("🔄 Zoom App Home redirected:", redirectUrl.toString());

      return NextResponse.redirect(redirectUrl.toString());
    } catch (e) {
      console.error("❌ Failed to retrieve token from Redis:", e);
      return NextResponse.redirect("https://donte.ngrok.io?error=token_not_found");
    }
  }

  const redirectUrl = buildRedirectUrl(request, searchParams, origin);
  console.log("🔄 Redirecting to Zoom Client Home:", redirectUrl);

  return NextResponse.redirect(redirectUrl);

}


// Utility to extract tokens from both query param and URL fragment fallback
function extractToken(key: string, searchParams: URLSearchParams, url: string) {
  // Check standard query param first
  const direct = searchParams.get(key);
  if (direct) return direct;

  // Handle case where URL contains a fragment (after '#' or '%23')
  const hashIndex = url.indexOf('#');
  const encodedHashIndex = url.indexOf('%23');

  let fragment = "";
  if (hashIndex !== -1) {
    fragment = url.substring(hashIndex + 1);
  } else if (encodedHashIndex !== -1) {
    fragment = decodeURIComponent(url.substring(encodedHashIndex)); // decode and remove `%23`
    if (fragment.startsWith('#')) fragment = fragment.substring(1); // remove actual '#'
  }

  if (fragment) {
    const fragmentParams = new URLSearchParams(fragment);
    return fragmentParams.get(key);
  }

  return null;
}

function buildRedirectUrl(request: NextRequest, searchParams: URLSearchParams, origin: string) {
  const isLocalEnv = process.env.NODE_ENV === "development";
  const next = searchParams.get("next") ?? "/";
  const host = "https://" + request.headers.get("x-forwarded-host");
  return isLocalEnv ? `${host}${next}` : `${origin}${next}`;
}

function handleZoomContext(header: string | null): { verified?: string } {
  if (!header) {
    console.log("ℹ️ No x-zoom-app-context header found. Likely first load in Zoom Client.");
    return {};
  }

  try {
    const context = decryptZoomAppContext(header, process.env.ZOOM_CLIENT_SECRET!);
    if (!context.act) {
      console.log("ℹ️ No 'act' field found in Zoom context.");
      return {};
    }

    const parsed = JSON.parse(context.act);
    console.log("🎬 Parsed Zoom Action:", parsed);
    return parsed;
  } catch (error) {
    console.error("❌ Failed to process Zoom context:", error);
    return {};
  }
}

function logRequest(url: string, header: string | null, params: URLSearchParams) {
  console.log("🔗 Request URL:", url, "\n");
  console.log("🔑 Zoom Header:", header, "\n");
  console.log("🔍 Search Params:", params.toString(), "\n");
  console.log("🔍 Extracted Tokens:", {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    provider_token: params.get("provider_token"),
    provider_refresh_token: params.get("provider_refresh_token"),
  }, "\n");
}