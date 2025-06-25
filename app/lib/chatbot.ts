'use server';

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

/**
 * Fetches an OAuth token for the Zoom chatbot.
 */
async function getTeamChatBotToken(): Promise<string> {
  try {
    const response = await fetch(`https://zoom.us/oauth/token?grant_type=client_credentials`, {
      method: 'POST',
      headers: {
        "Authorization": `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OAuth Token Fetch Failed:", data);
      throw new Error(`OAuth Token Error: ${response.status} - ${data.error_description || "Unknown error"}`);
    }

    return data.access_token;
  } catch (error) {
    console.error("🚨 Error fetching OAuth token:", error);
    throw new Error("Failed to retrieve OAuth token");
  }
}

/**
 * Formats the chatbot message.
 */
function formatMessage(activity: string, text: string, subtasks: string[], location: string): string {
    const formattedSubtasks = subtasks.length > 0
      ? subtasks.map(task => `• ${task}`).join("\n") 
      : "None";
  
    return [
      `📌 Activity: ${activity}\n`,
      `💬 Message: ${text}\n`,
      `📋 Subtasks:\n${formattedSubtasks}\n`,  
      
      `🔗 Ticket: ${location}\n`,
    ].join("\n");
  }

/**
 * Builds the correct Zoom Team Chat message payload.
 */
function buildMessagePayload(text: string, location: string) {
    return {
      robot_jid: process.env.ZOOM_BOT_JID, // Bot's JID
      to_jid: process.env.ZOOM_BOT_TO_JID, // Recipient's JID (User or Channel)
      user_jid: process.env.ZOOM_USER_JID, // Sender's JID
      account_id: process.env.ZOOM_ACCOUNT_ID, // Ensure this is set in .env
      content: {
        head: {
          text: "Task Notification 📢",
        },
        body: [
          {
            type: "message",
            text: text,
          },
          {
            type: "actions",
            limit: 2,
            items: [
              {
                text: "Open Zoom Dashboard",
                value: "button1",
                style: "Default",
                action: "dialog", 
                dialog: {
                  size: "M",
                  link: "https://donte.ngrok.io/dashboard",
                  title: { text: "Zoom Dashboard" },
                },
              },
              {
                text: "View Task",
                value: "button3",
                style: "Default",
                action: "dialog", 
                dialog: {
                  size: "M",
                  link: location,
                  title: { text: "View Task Details" },
                },
              },
            ],
          },
        ],
      },
    };
  }

/**
 * Sends a message to Zoom Team Chat.
 */
async function sendMessageToZoom(accessToken: string, payload: any): Promise<{ success?: boolean; error?: string }> {
    try {
      console.log("📨 Sending Message to Zoom Chat Chatbot:", JSON.stringify(payload, null, 2));
  
      const response = await fetch(`${ZOOM_API_BASE_URL}/im/chat/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Zoom API Error:", errorData);
        throw new Error(`Zoom API Error: ${response.status} - ${errorData}`);
      }
  
      return { success: true };
    } catch (error) {
      console.error("🚨 Error sending message to Zoom Team Chat Chatbot:", error);
      return { error: "Failed to send message" };
    }
  }

/**
 * Server Action: Handles sending messages to the Zoom Team Chatbot.
 */
export async function sendTeamChatBotMessage(prevState: any, formData: FormData) {
    try {
      // Extract and validate form data
      const text = formData.get("message")?.toString().trim();
      const activity = formData.get("activity")?.toString().trim();
      const location = formData.get("location")?.toString().trim();
      const selectedSubtasks = formData.getAll("subtasks").map(String);
  
      if (!text || !activity || !location) {
        return { error: "❌ Missing required fields" };
      }
  
      const accessToken = await getTeamChatBotToken();
      if (!accessToken) {
        return { error: "❌ Failed to retrieve access token" };
      }

      console.log("🔑 Zoom Team Chat Chatbot Access Token:", accessToken, `\n`);
  
      // Format the message & build the payload
      const formattedMessage = formatMessage(activity, text, selectedSubtasks, location);
      const messagePayload = buildMessagePayload(formattedMessage, location);
  
      // Send the message
      return await sendMessageToZoom(accessToken, messagePayload);
    } catch (error) {
      console.error("🚨 Error processing Zoom chatbot message:", error);
      return { error: "❌ Failed to process request" };
    }
  }

//Slash Command Chatbot Functions
/**
 * Get Recordings for the current user
 */
export async function handleGetRecordings(accessToken: string) {
  const response = await fetch(`${ZOOM_API_BASE_URL}/users/me/recordings`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recordings: ${response.statusText}`);
  }

  const recordingsData = await response.json();
  console.log("Recordings:", recordingsData);
  return recordingsData;
}

/**
 * Get AI Summary for a meeting
 * Note: This API is only available for paid accounts
 */
export async function handleAISummary(meetingId: string, accessToken: string) {
  const response = await fetch(`${ZOOM_API_BASE_URL}/meetings/${meetingId}/meeting_summary`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    // If needed, you can include a body with extra parameters here
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Failed to get AI summary: ${response.statusText}`);
  }
  return response.json();
}
