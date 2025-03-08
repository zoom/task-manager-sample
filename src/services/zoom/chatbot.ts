
const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

// Remove to cache retrieved access token
  export async function getTeamChatBot() {
    
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

  export async function sendTeamChatBotMessage(text: string, location: string) {
    console.log("Sending Team Chat Bot Message: \n", text);
    const { access_token } = await getTeamChatBot();
    // Optionally:  Make to_jid, user_jid, and account_id dynamic
    const messagePayload = {
      robot_jid: process.env.ZOOM_BOT_JID,
      to_jid: "tlma8otuqx-ujuoin1k0qq@xmpp.zoom.us",
      user_jid: "tlma8otuqx-ujuoin1k0qq@xmpp.zoom.us",
      account_id: "-RtWUD64T9KwsSAhmHAjaQ",
      content: {
        body: [
          {
            type: "message",
            text: text,
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
                  link: "https://donte.ngrok.io/zoom",
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
  
    try {
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
  
      return await response.json();
    } catch (error) {
      console.error("Error sending Zoom chatbot message:", error);
      throw error;
    }
  }
