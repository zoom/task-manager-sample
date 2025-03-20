"use client"; 

import { useState, useEffect } from "react";
import { triggerZoomAuth } from "@/utils/zoom/triggerZoomAuth";
import { verifyOtp, getCurrentSession, signOut } from "@/utils/supabase/auth2";
import { Session } from "@supabase/supabase-js";

export default function ZoomDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(""); // State for OTP input
  const [authMessage, setAuthMessage] = useState(""); // State for success/error messages
  const [session, setSession] = useState<Session | null>(null); // State to store user session

  // Step 1: Load session on page load
  useEffect(() => {
    async function loadSession() {
      const storedSession = await getCurrentSession();
      if (storedSession) {
        setSession(storedSession);
      
      }
    }
    loadSession();
  }, []);

  const handleZoomAuth = async () => {
    setLoading(true);

    const userId = "40da5d26-9fb0-42ba-bc5c-30798512c632"; // Replace with actual Zoom user ID
    const email = "donte.zoomie+max.test@gmail.com"; // Replace with the actual user's email

    const deeplink = await triggerZoomAuth(userId, email);

    console.log("Zoom authentication triggered", deeplink);

    if (deeplink) {
      //window.location.href = deeplink;
      window.open(deeplink, "_blank");
    } else {
      console.error("Failed to retrieve deep link.");
    }

    setLoading(false);
  };

  // Function to verify OTP and authenticate user
  const handleVerifyOtp = async () => {
    if (!otp) {
      setAuthMessage("Please enter the OTP code.");
      return;
    }

    setLoading(true);
    const email = "donte.zoomie+max.test@gmail.com"; 

    const userSession = await verifyOtp(email, otp);

    if (userSession) {
      setAuthMessage("✅ Successfully authenticated!");
      setSession(userSession); 

      // ✅ Force session reload in Zoom Client
      setTimeout(() => {
        window.location.reload();
        window.location.href = "/dashboard"; 
      }, 500);


      
    } else {
      setAuthMessage("❌ Failed to verify OTP. Please check and try again.");
    }

    setLoading(false);
  };

  // Function to logout
  const handleSignOut = async () => {
    await signOut();
    setSession(null);
    setAuthMessage("👋 Logged out successfully.");
  };

  return (
    <div className="flex flex-col w-full max-w-full p-4">
      <h2 className="text-lg font-bold">Welcome to Zoom Dashboard</h2>
      <p className="text-gray-600">This is your workspace inside the Zoom App.</p>

      {/* Show different UI based on authentication status */}
      {session ? (
        <>
          <p className="mt-2 text-green-600">✅ Logged in</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 mt-2 rounded-md"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          {/* Button to trigger authentication */}
          <button
            onClick={handleZoomAuth}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login with Zoom"}
          </button>

          {/* OTP Input Field */}
          <div className="mt-4">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              Enter OTP Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter 6-digit OTP"
            />
            <button
              onClick={handleVerifyOtp}
              className="bg-green-500 text-white px-4 py-2 mt-2 rounded-md disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </>
      )}

      {/* Display Authentication Message */}
      {authMessage && <p className="mt-2 text-sm font-semibold">{authMessage}</p>}
    </div>
  );
}
