"use client";

import { useEffect, useState } from "react";
import { getDeeplink } from "@/app/lib/zoom-api";

export default function ZoomLaunchRedirectHandler() {
  const [status, setStatus] = useState("🔄 Signing you in...");
  const [deeplink, setDeeplink] = useState<string | undefined>(undefined);

  useEffect(() => {
    const run = async () => {
      console.log("__________________________ Zoom App External Page _______________________", "\n");

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      console.log("🔗 Supabase Hash Params:", hashParams.toString(), "\n");

      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      const provider_token = hashParams.get("provider_token");
      const provider_refresh_token = hashParams.get("provider_refresh_token");

      const queryParams = new URLSearchParams(window.location.search);
      const state = queryParams.get("state")
      console.log("🪵 State from query params:", state, "\n");

      console.log("_____________ Auth Handler Page: Third-party OAuth with Supabase ______________", "\n");
      console.log("🧑‍🏫 LEARN MORE: https://developers.zoom.us/docs/zoom-apps/authentication/#third-party-oauth-optional", "\n");
      console.log("🔑 Extracted Supabase Provider Tokens from URL fragment:", {
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
          // url: '/dashboard',
          // role_name: 'Owner',
          // role_id: 0,
          //refresh_token,
          //access_token  // Exceed character 256 limit
          state: state, // TODO: Make dynamic
          verified: 'getToken',

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

      
      if (hashParams && hashParams.toString().length > 0) {
        console.log("🔄 <----- Sent query params to Home URL:-----> 🔄 ");

        const supaHashParams = new URLSearchParams(window.location.hash);
        const res = await fetch(`/api/zoom/entry/?state=${state}&${supaHashParams}`, {
          method: "GET",
          credentials: "include",
        });

        // Check if the response is ok
        //Sent query params to Home URL -- Home Route Will handle token extraction and redirect to the Zoom App

        // ✅ Open in a new tab
        const newTab = window.open(link, "_blank");
        if (!newTab || newTab.closed || typeof newTab.closed === "undefined") {
          console.warn("⚠️ Popup blocked. Showing button fallback.");
          setStatus("⚠️ Please click the button below to open the Zoom App.");
        } else {
          setStatus("✅ Zoom App opened in new tab.");
        }

        return;
      }
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
