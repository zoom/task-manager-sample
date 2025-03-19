"use client"; // Required for client-side interactions

import { useState } from "react";
import { triggerZoomAuth } from "@/utils/zoom/triggerZoomAuth";

export default function ZoomDashboardPage() {
  const [loading, setLoading] = useState(false);

  const handleZoomAuth = async () => {
    setLoading(true);
  
    const userId = "40da5d26-9fb0-42ba-bc5c-30798512c632"; // Replace with actual Zoom user ID
    const email = "donte.zoomie+max.test@gmail.com"; // Replace with the actual user's email
  
    const deeplink = await triggerZoomAuth(userId, email);
    
    console.log("Zoom authentication triggered", deeplink);
  
    if (deeplink) {
      // Redirect user to Zoom Deep Link
      window.location.href = deeplink;
    } else {
      console.error("Failed to retrieve deep link.");
    }
  
    setLoading(false);
  };
  

  return (
    <div className="flex flex-col w-full max-w-full p-4">
      <h2 className="text-lg font-bold">Welcome to Zoom Dashboard</h2>
      <p className="text-gray-600">This is your workspace inside the Zoom App.</p>

      {/* Button to trigger authentication */}
      <button
        onClick={handleZoomAuth}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md disabled:opacity-50"
      >
        {loading ? "Authenticating..." : "Login with Zoom"}
      </button>
    </div>
  );
}
