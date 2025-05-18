import { type NextRequest, NextResponse } from "next/server";
import { decryptZoomAppContext } from "@/app/lib/zoom-helper";
import { updateSession } from "@/utils/supabase/middleware";
import { getSupabaseUser } from "@/app/lib/token-store";

export async function GET(request: NextRequest) {
  console.log("__________________________Zoom Home Page Get Route________________________", "\n");
  const response = await updateSession(request);
  const { searchParams, origin } = new URL(request.url);
  const url = request.url;
  const zoomHeader = request.headers.get("x-zoom-app-context");

  logRequest(request.url, zoomHeader, searchParams);
  const parsedAction = handleZoomContext(zoomHeader);
  const { uid ,state,act} = parsedAction;

  const userId = uid;

  // Handle API mode from client request (no redirect)
  const result = await handleActParam(act, state);
  if (result) return result;

  const redirectUrl = buildRedirectUrl(request, searchParams, origin);
  console.log("🔄 Redirecting to Zoom Client Home:", redirectUrl, "\n");

  return NextResponse.redirect(redirectUrl);

}

/**
 * Helper function to handle the "act" parameter logic
 */
async function handleActParam(
  act: { verified?: string } | undefined,
  state: string | undefined
): Promise<Response | null> {
  if (act?.verified === "getToken") {
    console.log("⭐️ Action:", act.verified, "\n");

    try {
      const tokenData = await getSupabaseUser(state);
      console.log("🔐 Token retrieved from Redis:", tokenData, "\n");

      const redirectUrl = new URL("https://donte.ngrok.io");
      redirectUrl.searchParams.set("state", state ?? "");

      console.log("🔄 Zoom App Home redirected:", redirectUrl.toString(), "\n");

      return NextResponse.redirect(redirectUrl.toString());
    } catch (e) {
      console.error("❌ Failed to retrieve token from Redis:", e);
      return NextResponse.redirect("https://donte.ngrok.io?error=token_not_found");
    }
  }

  return null;
}

function buildRedirectUrl(request: NextRequest, searchParams: URLSearchParams, origin: string) {
  const isLocalEnv = process.env.NODE_ENV === "development";
  const next = searchParams.get("next") ?? "/";
  const host = "https://" + request.headers.get("x-forwarded-host");
  return isLocalEnv ? `${host}${next}` : `${origin}${next}`;
}

function handleZoomContext(header: string | null): {
  uid?: string;
  act?: any;
  verified?: string;
  state?: string;
} {
  if (!header) {
    console.log("ℹ️ No x-zoom-app-context header found. Likely first load in Zoom Client.");
    return {};
  }

  try {
    const context = decryptZoomAppContext(header, process.env.ZOOM_CLIENT_SECRET!);
    console.log("🔐 Decrypted Zoom Context:", context, '\n');

    // UID is already a plain string, do not parse
    const uid = context.uid;
    if (!uid) {
      console.log("⚠️ Zoom Context missing UID — invalid or malformed.");
      return {};
    }

    console.log("🧑‍💻 User ID from Zoom Context:", uid);

    
    // Act is optional — deep linking or context-based actions
    let act: any = undefined;
    let state: any  = undefined;
    if (context.act) {
      try {
        act = JSON.parse(context.act);
        console.log("🎬 Parsed Zoom Action Context:", act);

        state = act.state 
        if (act.state) {
          console.log("🧑‍💻 State from Action Context:", act.state);
        } else {
          console.log("⚠️ Action Context missing State — invalid or malformed.");
        }

      } catch (e) {
        console.warn("❌ Failed to parse 'act' from context:", e);
      }
    } else {
      console.log(" ⚠️  No 'act' value in Zoom Context — likely a standard app open.");
    }

    return {uid,act,state};
  } catch (error) {
    console.error("❌ Failed to process Zoom context:", error);
    return {};
  }
}



function logRequest(url: string, header: string | null, params: URLSearchParams) {
  console.log("🔗 Request URL:", url, "\n");
  console.log("🔍 HomeURL Template Parameters:");
  for (const [key, value] of Array.from(params.entries())) {
    console.log(`• ${key}: ${value}`);
  }
  console.log("\n","🚨 Note the Action Parameter will include the State param and deeplink Action!", '\n');
  console.log("🔑 Zoom Header:", header, "\n");
}