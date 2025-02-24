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
    console.log("Getting Team Chat Bot Token");

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

  export async function sendTeamChatBotMessage(accessToken: string) {
    console.log("Sending Team Chat Bot Message...");
  
    const messagePayload = {
      robot_jid: "v1e1l0-tgeqagn236xhwrepg@xmpp.zoom.us",
      to_jid: "tlma8otuqx-ujuoin1k0qq@xmpp.zoom.us",
      user_jid: "tlma8otuqx-ujuoin1k0qq@xmpp.zoom.us",
      account_id: "-RtWUD64T9KwsSAhmHAjaQ",
      content: {
        body: [
          {
            type: "message",
            text: "Hello From ChatBot Test",
          },{
            type: 'actions',
            limit: 3,
            items: [
              {
                text: 'Open Zoom App Webview 1',
                value: 'button1',
                style: 'Default',
                action: 'dialog',
                dialog: {
                  size: 'S',
                  title: {
                    text: 'Create a ticket',
                  },
                },
              },
              {
                text: 'Open Zoom App Webview 2',
                value: 'button2',
                style: 'Default',
                action: 'dialog',
                dialog: {
                  size: 'S',
                  link: 'https://donte.ngrok.io/zoom', // THIS SHOULD NOT BE USED IN PRODUCTION
                  title: {
                    text: 'Share a ticket',
                  },
                },
              },
            ],
          }
          
        ],
      },
    };
  
    const response = await fetch(`https://api.zoom.us/v2/im/chat/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });
  
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Failed to send message: ${response.status} - ${errorMessage}`);
    }
  
    return response.json();
  }

  


  