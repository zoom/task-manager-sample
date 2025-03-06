import { NextResponse } from "next/server";
import { sendTeamChatBotMessage } from "@/src/services/zoomApi";


export async function POST(req: Request) {
  try {

    // Note: sendTeamChatBotMessage internally fetches the bot token, so we don't need to pass any token here.
    const sendChatBotMessage = await sendTeamChatBotMessage();

    return NextResponse.json(sendChatBotMessage, { status: 200 });
  } catch (error) {
    console.error("Error sending chatbot message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}