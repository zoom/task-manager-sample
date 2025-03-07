const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

export interface ZoomMeeting {
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  agenda?: string;
  settings?: Record<string, any>;
}

/**
 * Create a Zoom Meeting
 */
export async function createZoomMeeting(accessToken: string, meetingData: ZoomMeeting) {


  const response = await fetch(`${ZOOM_API_BASE_URL}/users/me/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meetingData),
  });

  if (!response.ok) {
    console.error('Error creating Zoom meeting:', response.statusText);
    throw new Error(`Failed to create meeting: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get Zoom Meetings
 */
export async function getZoomMeetings(accessToken: string) {
  const response = await fetch(`${ZOOM_API_BASE_URL}/users/me/meetings`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('Error fetching Zoom meetings:', response.statusText);
    throw new Error(`Failed to fetch meetings: ${response.statusText}`);
  }

  return response.json();
}
/**
 * List Chat Channels
 */

export async function getuserChannels(accessToken: string) {
    const response = await fetch(`${ZOOM_API_BASE_URL}/chat/users/me/channels`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      console.error('Error fetching Zoom meetings:', response.statusText);
      throw new Error(`Failed to fetch meetings: ${response.statusText}`);
    }
  
    return response.json();
  }

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

  /**
 * Get Zoom Chat Channel Messages
 * @param channelId - The unique identifier of the Zoom chat channel
 * @param accessToken - OAuth access token for API authorization
 * @returns The API response data
 * @throws Error if the API request fails 
 * @scopes chat_channel:read
 */ 

  export async function getChatChannelMessages(channelId: string, accessToken: string) {
    const response = await fetch(`${ZOOM_API_BASE_URL}/chat/channels/${channelId}/messages`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      console.error('Error fetching Zoom chat messages:', response.statusText);
      throw new Error(`Failed to fetch chat messages: ${response.statusText}`);
    }
  
    return response.json();
  }
  

  /**
 * Adds an app to a Zoom meeting
 * @param meetingId - The unique identifier of the Zoom meeting
 * @param accessToken - OAuth access token for API authorization
 * @returns The API response data
 * @throws Error if the API request fails
 * @scopes meeting:write:open_app
 * @enableWebPortalSetting Zoom Apps Quick Launch Button
 * @webPortalSetting  https://www.zoom.us/profile/setting?&tab=zoomapps
 */
export async function addMeetingApp(meetingId: string, accessToken: string) {
  try {
    const response = await fetch(`${ZOOM_API_BASE_URL}/meetings/${meetingId}/open_apps`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to add meeting app: ${response.status} - ${errorData}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error adding app to meeting ${meetingId}:`, error);
    throw error;
  }
}


  