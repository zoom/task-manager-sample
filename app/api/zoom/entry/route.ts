import { type NextRequest, NextResponse } from "next/server";
import { decryptZoomAppContext } from "@/app/lib/zoom-helper";
import { updateSession } from "@/utils/supabase/middleware";

export async function GET(request: NextRequest) {
  const response = await updateSession(request);

  const zoomHeader = request.headers.get("x-zoom-app-context");
  const { searchParams, origin } = new URL(request.url);

  console.log("__________________________Zoom App Home Page Route___________________________", "\n");
  console.log("🔗 GET Request Handler:\n", "https://developers.zoom.us/docs/zoom-apps/zoom-app-context/#homeurl-template-parameters", "\n");
  console.log("🔗 Request URL Recieved:", request.url, "\n");

  // Should be Null or Undefined from browser request
  console.log("🔍 HomeURL Template Params: ", searchParams, "\n");

  // HomeURL template parameters
  // URL : https://developers.zoom.us/docs/zoom-apps/zoom-app-context/#homeurl-template-parameters
  const action = searchParams.get('action')

  // // What if I send the access token and refresh token in the URL fragment:
  // // TO: https://donte.ngrok.io/api/zoom/entry/
  // // INSTEAD OF:  https://donte.ngrok.io/zoom/launch
  let access_token = searchParams.get("access_token");
  let refresh_token = searchParams.get("refresh_token");
  let provider_token = searchParams.get('provider_token');
  let provider_refresh_token = searchParams.get("provider_refresh_token");

  // If not found, check for it mistakenly embedded in the 'code' param
if (!access_token) {
  const codeParam = searchParams.get("code") ?? "";
  if (codeParam.startsWith("#access_token=")) {
    // Clean and parse the string into individual params
    const fixedParams = new URLSearchParams(codeParam.slice(1)); // remove #
    access_token = fixedParams.get("access_token");
    refresh_token = fixedParams.get("refresh_token") ?? refresh_token;
    provider_token = fixedParams.get("provider_token") ?? provider_token;
    provider_refresh_token = fixedParams.get("provider_refresh_token") ?? provider_refresh_token;
  }
}

  console.log(`🚨 Access Token from search params: \n\n ${access_token}\n`);
  console.log(
    "🏡 Zoom APP Home ROUTE: Extracted Tokens from URL search Params:\n",
    {
      access_token,
      refresh_token,
      provider_refresh_token,
      provider_token,
    }, "\n"
  );


  const isLocalEnv = process.env.NODE_ENV === "development";
  const forwardedHost = "https://" + request.headers.get("x-forwarded-host");
  const next = searchParams.get("next") ?? "/";

  // Should be Null or Undefined from browser request
  if (!zoomHeader) {
    console.warn("⚠️  No Zoom context header");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  } else {
    console.log(`🧩 Incoming x-zoom-app-context header on Zoom App HOME PAGE ROUTE:------------------\n\n${zoomHeader}\n`);
    console.log(`🏡 Home Template URL Action Param:------------------------------------\n\n${action}\n`);
  }

  try {
    const context = decryptZoomAppContext(
      zoomHeader,
      process.env.ZOOM_CLIENT_SECRET!
    );

    if (zoomHeader) {

      console.log("🔐 Decrypted Zoom Context Header:\n", context, "\n");

      const { act } = context;
      console.log(`🎬 Action context value: \n\n ${act}\n`);

      // Set decrypted context as a cookie, not being set as expected!
      response.cookies.set("zoom_context", JSON.stringify(context), {
        path: "/",
        httpOnly: false,
        secure: true,
        sameSite: "lax",
      });
    }

    const redirectUrl = isLocalEnv
      ? `${forwardedHost}${next}`
      : `${origin}${next}`;


    console.log(`🔄 Redirecting to Zoom Client Home Page: ${redirectUrl} \n`);
    response.headers.set("Location:", redirectUrl);
    // return response;
    // send the access token and refresh token in the URL fragment for redirect

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error("❌ Failed to decode Zoom context:", err.message);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
