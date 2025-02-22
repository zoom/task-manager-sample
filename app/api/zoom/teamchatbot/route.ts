import { NextResponse } from "next/server";
import { getTeamChatBot, sendTeamChatBotMessage } from "@/src/services/zoomApi";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { topic, type, start_time, duration, timezone } = await req.json();

    //  Await cookies() before passing to Supabase
    const cookieStore = await cookies();

    //  Use Supabase Server Client for API Routes
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
    console.log("Team Chat Bot Token");

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized: No Zoom Access Token" }, { status: 401 });
    }

    // Call Zoom API with the access token
    const meetingData = { topic, type, start_time, duration, timezone };
    const getTeamChatBotToken = await getTeamChatBot();
    
    // send chatbot message to zoom
    const sendChatBotMessage = await sendTeamChatBotMessage(getTeamChatBotToken.access_token);
   
    return NextResponse.json(sendChatBotMessage, { status: 200 });
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
