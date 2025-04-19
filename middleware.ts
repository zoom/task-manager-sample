import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const zoomHeader = request.headers.get("x-zoom-app-context");
  const response = await updateSession(request);

  if (zoomHeader) {
    response.cookies.set("zoom_context", zoomHeader, {
      path: "/",
      httpOnly: false, // allow client-side JS to read it (optional: only for non-sensitive data)
      secure: true,
      sameSite: "lax",
    });
    console.log("🧩 Zoom App Context Header received in middleware:\n", zoomHeader, "\n");
  } else {
    console.log("⚠️ No x-zoom-app-context header present.", '\n');
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
