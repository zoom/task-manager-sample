import { NextRequest, NextResponse } from "next/server";
//import { handleGetRecordings, handleAISummary } from "@/app/lib/chatbot";
import crypto from "crypto";

const ZOOM_SECRET_TOKEN = process.env.ZOOM_SECRET_TOKEN || "";
const ZOOM_VERIFICATION_TOKEN = process.env.ZOOM_VERIFICATION_TOKEN || "";

// Command dispatcher mapping commands to handler functions
const commandHandlers: Record<string, (payload: any) => Promise<any>> = {
  "getrecordings": handleGetRecordings,
  "aisummary": async (payload: any) => {
    const { accessToken, meetingId } = payload;
    return handleAISummary(accessToken, meetingId);
  },
  "assignTask": async (payload: any) => {
    const command = payload.cmd;
    console.log("Task Command", command);
    //Need to retrieve the token from a persistent storage location or use a service account flow.
    const accessToken = process.env.TEMP_ZOOM_ACCESS_TOKEN;
    console.log("Access Token Webhook", accessToken);
    
    if (!accessToken) {
      return { error: "No Zoom Access Token" };
    }
    return handleGetRecordings(accessToken);
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "No Request Body" }, { status: 400 });
    }

    // Handle Zoom Webhook URL validation
    if (body.event === "endpoint.url_validation") {
      const hashForValidation = crypto
        .createHmac("sha256", ZOOM_SECRET_TOKEN)
        .update(body.payload.plainToken)
        .digest("hex");

      return NextResponse.json({
        plainToken: body.payload.plainToken,
        encryptedToken: hashForValidation,
      });
    }

    // // Verify Authorization Header (Optional but Recommended)
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader !== ZOOM_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
    }

    // Process Webhook Events
    if (body.event === "bot_notification") {
      console.log(" 🏁 Bot Notification Received", body.payload);

      // Extract the slash command from the payload
      // (Assuming the slash command is available as body.payload.command)
      const command = body.payload.cmd;

      if (command && commandHandlers[command]) {
        console.log(" Command Handler", command);
        const result = await commandHandlers[command](body.payload);
        return NextResponse.json(result, { status: 200 });
      } else {
        console.warn("Unknown or missing slash command:", command);
        return NextResponse.json({ error: "Unknown command" }, { status: 400 });
      }
    }

    // Process Webhook Events
    switch (body.event) {
      case 'bot_installed':
        console.log("✅ Bot Installed", body.payload);
        return NextResponse.json({ message: "Bot installed successfully." }, { status: 200 });

      case 'team_chat.link_shared':
        console.log("🤖 Unfurlable Link Shared", body.payload);
        return NextResponse.json({ message: "Bot installed successfully." }, { status: 200 });

      default:
        console.warn("⚠️ Unknown event:", body.event);
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ Error handling Zoom webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
