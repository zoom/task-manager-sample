import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ZOOM_SECRET_TOKEN = process.env.ZOOM_SECRET_TOKEN || "";
const ZOOM_VERIFICATION_TOKEN = process.env.ZOOM_VERIFICATION_TOKEN || "";

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

    // // Verify Authorization Header (Optional but recommended)
    const authHeader = req.headers.get("authorization") || "";
    if (authHeader !== ZOOM_VERIFICATION_TOKEN) {
      return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
    }

    // Process Webhook Events
    switch (body.event) {

      case "team_chat.channel_message_posted":
        console.log("📢 Team Chat Channel Posted Notification:", body.payload);
        return NextResponse.json({ message: "Notification received." }, { status: 200 });

      case "team_chat.chatbot_added":
        console.log("👁️ Team Chat Channel Bot 🤖 Added Notification:", body.payload);
        return NextResponse.json({ message: "Notification received." }, { status: 200 });

      default:
        console.warn("⚠️ Unknown event:", body.event);
        return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ Error handling Zoom webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}