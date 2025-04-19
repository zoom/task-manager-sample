"use client";

import { useEffect, useState } from "react";
import { getDeeplink } from "@/app/lib/zoom-api";


export default function ZoomLaunchRedirectHandler() {
  const [status, setStatus] = useState("🔄 Signing you in...");
  const [deeplink, setDeeplink] = useState<string | undefined>(undefined);

  useEffect(() => {
    const run = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      const provider_token = hashParams.get("provider_token");
      const provider_refresh_token = hashParams.get("provider_refresh_token");
   
      console.log("🔑 Extracted Tokens from URL fragment:", {
        access_token,
        refresh_token,
        provider_token,
        provider_refresh_token,
      });

      if (!access_token || !refresh_token) {
        setStatus("❌ Missing access or refresh token");
        return;
      }

      setStatus("✅ Supabase session set! Getting Zoom App link...");

      // Construct data to pass to getDeeplink
      const data = {
        action: JSON.stringify({ // MAX: 256
          url: '/dashboard',
          role_name: 'Owner',
          verified: 1,
          role_id: 0,
          refresh_token,         
          access_token  // May exceed character 256 limit
               
        }),
      };

      console.log('Redirecting to Zoom client via deeplink . . .', '\n')
      const link = await getDeeplink(provider_token, data);
      console.log("🔗 Zoom deeplink:", link, '\n');

      if (!link) {
        setStatus("❌ Failed to retrieve Zoom deeplink");
        return;
      }

      setDeeplink(link);

      // ✅ Attempt to open in a new tab
      // const newTab = window.open(link, "_blank");
      // if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
      //   console.warn("⚠️ Popup blocked. Showing button fallback.");
      //   setStatus("⚠️ Please click the button below to open the Zoom App.");
      // } else {
      //   setStatus("✅ Zoom App opened in new tab.");
      // }


    };

    run();
  }, []);

  return (
    <div className="p-4 text-center text-sm">
      <p>{status}</p>

      {deeplink && (
        <div className="mt-4">
          <button
            onClick={() => window.open(deeplink, "_blank")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open Zoom App
          </button>
        </div>
      )}
    </div>
  );
}
