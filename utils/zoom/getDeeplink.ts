import { getMagicLink } from "@/utils/supabase/auth"; // Import function to generate magic link

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

const getDeeplink = async (accessToken: string, email: string) => {
  try {
    // Step 1: Generate Supabase Magic Link
    const otpMatch = await getMagicLink(email);

    console.log("Magic Link URL:", otpMatch);

    if (!otpMatch) {
      throw new Error("Failed to generate magic link");
    }

    // Step 2: Construct the request payload for Zoom API
    const requestBody = {
      data: {
        action: JSON.stringify({
          url: otpMatch,
          role_name: "Owner",
          verified: 1,
          role_id: 0,
        }),
      },
    };

    // Step 3: Send request to Zoom Deep Link API
    const response = await fetch(`${ZOOM_API_BASE_URL}/zoomapp/deeplink`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody), // Ensure proper JSON format
    });

    

    if (!response.ok) {
      throw new Error(`Zoom API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Step 4: Extract the deep link from the response
    if (!result.deeplink) {
      throw new Error("No deep link returned from Zoom API");
    }

    return result.deeplink; // Return the deep link for redirection
  } catch (error) {
    console.error("Error getting Zoom deep link:", error);
    throw error;
  }
};

export default getDeeplink;
