const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

/**
 * List Get user's chontacts
 */

export async function getuserContacts(accessToken: string) {
  const response = await fetch(`${ZOOM_API_BASE_URL}/chat/users/me/contacts?type=company`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('Error fetching User Contacts:', response.statusText);
    throw new Error(`Failed to fetch User Contacts: ${response.statusText}`);
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

    