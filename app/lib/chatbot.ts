
'use server';

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

async function getTeamChatBot() {
  const response = await fetch(`https://zoom.us/oauth/token?grant_type=client_credentials`, {
    method: 'POST',
    headers: {
      "Authorization": `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OAuth token: ${response.status} - ${await response.text()}`);
  }

  return response.json();
}

export async function sendTeamChatBotMessage(prevState: any, formData: FormData) {
  try {
    const text = formData.get("message") as string;
    const activity = formData.get("activity") as string;
    const location = formData.get("location") as string;
    const selectedSubtasks = formData.getAll("subtasks").map(String);

    const { access_token } = await getTeamChatBot();

    const messageLines = [
      `Activity: ${activity}`,
      `Message: ${text}`,
      `Subtasks: ${selectedSubtasks.length > 0 ? selectedSubtasks.join(", ") : "None"}`,
      `Ticket: ${location}`,
    ];

    const formattedMessage = messageLines.join("\n");

    const messagePayload = {
      robot_jid: process.env.ZOOM_BOT_JID,
      to_jid: "tlma8otuqx-ujuoin1k0qq@xmpp.zoom.us",
      user_jid: "tlma8otuqx-ujuoin1k0qq@xmpp.zoom.us",
      account_id: "-RtWUD64T9KwsSAhmHAjaQ",
      content: {
        body: [
          {
            type: "message",
            text: formattedMessage,
          },
          {
            type: "actions",
            limit: 3,
            items: [
              {
                text: "Open Zoom App Webview",
                value: "button1",
                style: "Default",
                action: "dialog",
                dialog: {
                  size: "S",
                  link: "https://donte.ngrok.io/zoom-dashboard",
                  title: {
                    text: "Create a ticket",
                  },
                },
              },
              {
                text: "Review Task",
                value: "button2",
                style: "Default",
                action: "dialog",
                dialog: {
                  size: "L",
                  link: location,
                  title: {
                    text: "Share a ticket",
                  },
                },
              },
            ],
          },
        ],
      },
    };

    const response = await fetch(`${ZOOM_API_BASE_URL}/im/chat/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to send message: ${response.status} - ${errorMessage}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending Zoom chatbot message:", error);
    return { error: "Failed to send message" };
  }
}


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

