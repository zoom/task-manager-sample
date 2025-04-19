import { type NextRequest, NextResponse } from "next/server";
import { decryptZoomAppContext } from "@/app/lib/zoom-helper";
import { updateSession } from "@/utils/supabase/middleware";

export async function GET(request: NextRequest) {
  const response = await updateSession(request);

  const zoomHeader = request.headers.get("x-zoom-app-context");
  const { searchParams, origin } = new URL(request.url);

  console.log("🔍 Request URL Search Params :", searchParams, "\n");

  // HomeURL template parameters
  // URL : https://developers.zoom.us/docs/zoom-apps/zoom-app-context/#homeurl-template-parameters
  const action = searchParams.get('action')

  // // What if I send the access token and refresh token in the URL fragment:
  // // TO: https://donte.ngrok.io/api/zoom/entry/
  // // INSTEAD OF:  https://donte.ngrok.io/zoom/launch
  const access_token = searchParams.get("access_token");
  const refresh_token = searchParams.get("refresh_token");
  const provider_token = searchParams.get('provider_token');
  const provider_refresh_token = searchParams.get("provider_refresh_token");

  // Try to extract tokens from the URL search params
  const tokenParams = new URLSearchParams();

  if (access_token) tokenParams.set("access_token", access_token);
  if (refresh_token) tokenParams.set("refresh_token", refresh_token);
  if (provider_token) tokenParams.set("provider_token", provider_token);
  if (provider_refresh_token) tokenParams.set("provider_refresh_token", provider_refresh_token);

  console.log("🔑 Extracted Tokens Params:", tokenParams, '/n')


  console.log("🚨  Access Token from search params:", access_token, "\n");


  console.log("🔑 Zoom APP Home ROUTE: Extracted Tokens from URL search Params:",
    {
      access_token,
      refresh_token,
      provider_refresh_token,
      provider_token,
    },
    "\n"
  );


  const isLocalEnv = process.env.NODE_ENV === "development";
  const forwardedHost = "https://" + request.headers.get("x-forwarded-host");
  const next = searchParams.get("next") ?? "/";

  console.log(`🧩 Incoming x-zoom-app-context header on Zoom App HOME PAGE ROUTE:------------------\n\n${zoomHeader}\n`);
  console.log(`🤖 Home Template URL Action Param:------------------\n\n${action}\n`);



  if (!zoomHeader) {
    console.warn("⚠️ No Zoom context header");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  try {
    const context = decryptZoomAppContext(
      zoomHeader,
      process.env.ZOOM_CLIENT_SECRET!
    );

    console.log("🔐 Decrypted Zoom Context Header:", context, "\n");

    const { act } = context;
    console.log("🔗 Action from context:", act, "\n");

    // Set decrypted context as a cookie, not being set as expected!
    response.cookies.set("zoom_context", JSON.stringify(context), {
      path: "/",
      httpOnly: false, 
      secure: true,
      sameSite: "lax",
    });

    const redirectUrl = isLocalEnv
      ? `${forwardedHost}${next}`
      : `${origin}${next}`;

    
    const redirectUrl2 = isLocalEnv
    ? `${forwardedHost}${next}?${tokenParams}`
    : `${origin}${next}?${tokenParams}`;

    console.log("🔄 Redirecting to:", redirectUrl2, "\n");
    response.headers.set("Location", redirectUrl2);
    //return response;
    // send the access token and refresh token in the URL fragment for redirect

    return NextResponse.redirect(redirectUrl2);
  } catch (err: any) {
    console.error("❌ Failed to decode Zoom context:", err.message);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
