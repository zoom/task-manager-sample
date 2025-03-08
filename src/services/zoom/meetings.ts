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


  