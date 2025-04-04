'use server';

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

/**
 * List Get user's contacts
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
 * Note: Not Used in this example, yet
 */

export async function getuserChannels(accessToken: string) {
  const response = await fetch(`${ZOOM_API_BASE_URL}/chat/users/me/channels`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('Error fetching Zoom channels:', response.statusText);
    throw new Error(`Failed to fetch channels: ${response.statusText}`);
  }

  const data = await response.json();

  console.log('Channels:', data.channels); // Log the channels array
 
  return data.channels; // Return the channels array directly
}



    /**
   * Get Zoom Chat Channel Messages
   * @param channelId - The unique identifier of the Zoom chat channel
   * @param accessToken - OAuth access token for API authorization
   * @returns The API response data
   * @throws Error if the API request fails 
   * @scopes chat_channel:read
   * Note: Not Used in this example yet
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


    export interface ZoomIMAtItem {
      at_contact: string | number;
      at_type: number;
      start_position: number;
      end_position: number;
    }
    
    export interface ZoomIMRichText {
      start_position: number;
      end_position: number;
      format_type: string;
      format_attr: string;
    }
    
    export interface ZoomIMInteractiveCard {
      card_json: string;
    }
    
    // This interface is your existing payload format.
    export interface ZoomIMMessagePayload {
      message: string;
      to_channel?: string;
      to_contact?: string;
      at_items?: ZoomIMAtItem[];
      rich_text?: ZoomIMRichText[];
      file_ids?: string[];
      reply_main_message_id?: string;
      interactive_cards?: ZoomIMInteractiveCard[];
      content?: Record<string, any>;
    }
    
    // Define an options interface so you can pass parameters separately.
    export interface ZoomIMMessageOptions {
      message: string;
      to_channel?: string;
      to_contact?: string;
      at_items?: ZoomIMAtItem[];
      rich_text?: ZoomIMRichText[];
      file_ids?: string[];
      reply_main_message_id?: string;
      interactive_cards?: ZoomIMInteractiveCard[];
      content?: Record<string, any>;
    }
    
    /**
     * Send a Zoom IM message using dynamic options.
     * At least one of to_channel or to_contact must be provided.
     */
    export async function sendZoomIMMessage(
      accessToken: string,
      options: ZoomIMMessageOptions
    ): Promise<any> {
      if (!options.to_channel && !options.to_contact) {
        throw new Error("Either 'to_channel' or 'to_contact' must be provided.");
      }
    
      // Build the payload using the options provided.
      const payload: ZoomIMMessagePayload = {
        message: options.message,
        to_channel: options.to_channel,
        to_contact: options.to_contact,
        at_items: options.at_items,
        rich_text: options.rich_text,
        file_ids: options.file_ids,
        reply_main_message_id: options.reply_main_message_id,
        interactive_cards: options.interactive_cards,
        content: options.content,
      };

      console.log("Zoom IM Message Payload:", payload);
    
      const url = `${ZOOM_API_BASE_URL}/chat/users/me/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
      }
    
      const data = await response.json();
      console.log("Zoom IM Message Response:", data);
      return data;
    }
    
    