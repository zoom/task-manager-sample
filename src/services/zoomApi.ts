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

    console.log("Creating Zoom meeting with data:", meetingData);

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
