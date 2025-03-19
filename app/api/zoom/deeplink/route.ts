import { NextResponse } from "next/server";
import getDeeplink from "@/utils/zoom/getDeeplink"; // Import function
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { userId, email} = await request.json(); // Get user details

    const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll: async () => cookieStore.getAll(),
            },
          }
        );
    
        //  Fetch the Supabase session securely
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
    
        if (sessionError || !sessionData?.session) {
          console.error("Session error:", sessionError);
          return NextResponse.json({ error: "Unauthorized: No valid session" }, { status: 401 });
        }
    
        const accessToken = sessionData.session.provider_token; // Zoom OAuth token

    if (!userId || !email || !accessToken) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Step 1: Get the Zoom deep link (this internally generates the magic link)
    const deeplink = await getDeeplink(accessToken, email);

    return NextResponse.json({ success: true, deeplink });
  } catch (error) {
    console.error("Error triggering Zoom deep link:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
