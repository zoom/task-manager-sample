import { type NextRequest, NextResponse } from "next/server";
import { decryptZoomAppContext } from "@/app/lib/zoom-helper";
import { updateSession } from "@/utils/supabase/middleware";

export async function GET(request: NextRequest) {
  const response = await updateSession(request);

  const zoomHeader = request.headers.get("x-zoom-app-context");
  const { searchParams, origin } = new URL(request.url);

  // HomeURL template parameters
  // URL : https://developers.zoom.us/docs/zoom-apps/zoom-app-context/#homeurl-template-parameters
  const action = searchParams.get('action')

  const isLocalEnv = process.env.NODE_ENV === "development";
  const forwardedHost = "https://" + request.headers.get("x-forwarded-host");
  const next = searchParams.get("next") ?? "/";

  console.log("🧩 Incoming Zoom App Context Header To Zoom App HOME PAGE:", '\n' + zoomHeader, '\n');
  console.log("🤖 Home Template URL Action Param:", action);

  if (!zoomHeader) {
    console.warn("⚠️ No Zoom context header");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  try {
    const context = decryptZoomAppContext(
      zoomHeader,
      process.env.ZOOM_CLIENT_SECRET!
    );

    console.log("🔐 Decrypted Zoom Context:", context);

    // Set decrypted context as a cookie, not being set as expected!
    response.cookies.set("zoom_context", JSON.stringify(context), {
      path: "/",
      httpOnly: false, // 👈 allow client access
      secure: true,
      sameSite: "lax",
    });

    const redirectUrl = isLocalEnv
      ? `${forwardedHost}${next}`
      : `${origin}${next}`;
      
    response.headers.set("Location", redirectUrl);

    return NextResponse.redirect(redirectUrl);
  } catch (err: any) {
    console.error("❌ Failed to decode Zoom context:", err.message);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
