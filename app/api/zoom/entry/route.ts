import { type NextRequest, NextResponse } from "next/server";
import { decryptZoomAppContext } from "@/app/lib/zoom-helper";
import { updateSession } from "@/utils/supabase/middleware";
import { upsertSupabaseUser, getSupabaseUser } from "@/app/lib/supabaseTokenStore";

import { createClient } from "@/utils/supabase/server";


export async function GET(request: NextRequest) {
  console.log("____________________________Zoom Entry Get Route__________________________", "\n");
  const response = await updateSession(request);
  const { searchParams, origin } = new URL(request.url);
  const zoomHeader = request.headers.get("x-zoom-app-context");
  const userId = "tlMA8OtuQX-UjUoIN1k0qQ"; // TODO: Make dynamic

  logRequest(request.url, zoomHeader, searchParams);

  const access_token = extractToken("access_token", searchParams);
  const refresh_token = extractToken("refresh_token", searchParams);

  console.log("🔑 Access Token:", access_token, '\n');
  console.log("🔑 Refresh Token:", refresh_token, '\n');

  if (access_token && refresh_token) {
    const sessionRedirect = await setSupabaseSession(request, access_token, refresh_token);
    if (!sessionRedirect) {
      return NextResponse.redirect("https://donte.ngrok.io?error=supabase_session_failed");
    }
    return sessionRedirect;
    await upsertSupabaseUser(userId, access_token, refresh_token, Date.now() + 3600 * 1000);
    console.log("✅ Tokens stored in Redis");
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
      redirectUrl.searchParams.set("access_token", tokenData.accessToken);
      redirectUrl.searchParams.set("refresh_token", tokenData.refreshToken);

      console.log("🔄 Redirecting to Zoom App Home:", redirectUrl.toString());

      return NextResponse.redirect(redirectUrl.toString());
    } catch (e) {
      console.error("❌ Failed to retrieve token from Redis:", e);
      return NextResponse.redirect("https://donte.ngrok.io?error=token_not_found");
    }
  }

  const redirectUrl = buildRedirectUrl(request, searchParams, origin);
  console.log("🔄 Redirecting to Zoom Client Home:", redirectUrl);
  response.headers.set("Location", redirectUrl);

  return NextResponse.redirect(redirectUrl);

}

async function setSupabaseSession(
  request: NextRequest,
  access_token: string,
  refresh_token: string
): Promise<NextResponse | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });

  if (error) {
    console.error("❌ Supabase session error:", error.message);
    return null;
  }

  console.log("✅ Supabase session set successfully:", data);

  const isLocalEnv = process.env.NODE_ENV === 'development';
  const forwardedHost = request.headers.get('x-forwarded-host');
  const origin = new URL(request.url).origin;

  const redirectBase = isLocalEnv && forwardedHost
    ? `https://${forwardedHost}`
    : origin;

  return NextResponse.redirect(`${redirectBase}/dashboard`);
}



// Utility to extract tokens from both query param and URL fragment fallback
function extractToken(key: string, searchParams: URLSearchParams) {
  const value = searchParams.get(key);
  if (value) return value;

  const codeParam = searchParams.get("code") ?? "";
  if (codeParam.startsWith("#")) {
    const parsed = new URLSearchParams(codeParam.slice(1));
    return parsed.get(key);
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
  console.log("🔍 Extracted Tokens:", {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    provider_token: params.get("provider_token"),
    provider_refresh_token: params.get("provider_refresh_token"),
  }, "\n");
}