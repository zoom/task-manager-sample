import { NextResponse } from "next/server";
import { sendTeamChatBotMessage } from "@/src/services/zoom/chatbot";

export async function POST(req: Request) {
  try {
   
    const { message } = await req.json();

    // Get the referer from the request headers.
    const location = req.headers.get("referer") || "";
    console.log("\n-----------------------------------------\n");
    console.log("ChatBot Payload Data:" ,{ message, location });
    console.log("\n-----------------------------------------\n");
   
    const sendChatBotMessage = await sendTeamChatBotMessage(message.text, location);
    console.log("\n-----------------------------------------\n");
    console.log("ChatBot Response Message ID:", sendChatBotMessage);
    console.log("\n-----------------------------------------\n");
    console.log("Add Chat Bot Threading functionality here");
    
    return NextResponse.json(sendChatBotMessage, { status: 200 });
  } catch (error) {
    console.error("Error sending chatbot message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
