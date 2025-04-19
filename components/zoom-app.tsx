"use client";

import { useEffect, useState } from "react";
import zoomSdk from "@zoom/appssdk";
import { createClient } from '@/utils/supabase/client';
import { decryptZoomAppContext } from "@/app/lib/zoom-helper";
import { Button } from "./ui/button";

import { usePathname } from 'next/navigation';

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function ZoomAuth() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [runningContext, setRunningContext] = useState(null);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const location = usePathname();
  
  // Known working verifier and challenge pair, has to been SHA256 then base64url encoded
  const code_verifier = "fr4O07RDpEBQQzbgKK3sIP7ePRU5YIhdb5lTfVAoLU4";

  //SHA256 then base64url encoded code_verifier
  const code_challenge = "ZjBjMDdjYWEwODJkYjQ0NDZjNDEwODc0MzljYjA2ZGRlYTk3YzM0YmI3YzljZDVjNTcxOTI0NzMyODhhMmZhYg==";

  const hardcodedState = "TIA5UgoMte";
  const next = "/dashboard";

  const authorize = async () => {
    try {
      setAuthStatus("loading");
      await zoomSdk.authorize({
        codeChallenge: code_challenge,
        state: hardcodedState,
      });
    } catch (e) {
      console.error("Zoom SDK authorize error:", e);
      setAuthStatus("error");
    }
  };

  const handleAuthorization = async (event: any) => {
    console.log("Authorization event:", event);
    const { code, state } = event;

    const next = "/dashboard"; // Or dynamically from event or state

    // Supabase OAuth redirect URIs
    const zoomAppUrl = `${window.location.origin}${next}`;
    console.log("Zoom App URL:", zoomAppUrl);

    // Your Supabase project REF (update if different)
    const supabaseProjectRef = "svkmdyqdhpvqvgyosxmc";

    try {

      const zoomAppRedirect = `${window.location.origin}/zoom/launch`;
      console.log("Zoom App Redirect:", zoomAppRedirect);

      const zoomHomeAPIRoute = `${window.location.origin}api/zoom/entry/`;

      console.log("Zoom Home API Route:", zoomHomeAPIRoute);

      // Add to url to site: https://donte.ngrok.io/zoom/launch

      // Construct external Supabase OAuth authorization URL, which deep links to your app
      // Note: This URL is used to open the Supabase OAuth flow in Zoom's in-client browser
      const supabaseAuthUrl =
        `https://${supabaseProjectRef}.supabase.co/auth/v1/authorize?provider=zoom&redirect_to=${encodeURIComponent(zoomAppRedirect)}`;

      /*
      Set Open your app outside of a meeting url pattern as Supabase default redirect URL 
      Supabase URL Configuration : https://supabase.com/dashboard/project/svkmdyqdhpvqvgyosxmc/auth/url-configuration
      
      */
     
      // ✅ 2. Open the Supabase Zoom OAuth flow in the browser
      await zoomSdk.openUrl({ url: supabaseAuthUrl });
      console.log("✅ Opened Supabase Zoom OAuth in browser");

      ///..... // Handle the response from Supabase


    } catch (error) {
      console.error("❌ Error opening Supabase auth URL:", error);
      setAuthStatus("error");
    }
  };

  // Configure the Zoom SDK and check running context
  // Need to configure a way to get the deeplink token onDeeplink to Zoom client
  // Reality Check: You cannot access the x-zoom-app-context header from the client (frontend)

  // Third Party OAuth: https://developers.zoom.us/docs/zoom-apps/authentication/#third-party-oauth-optional

  // Tried to use the x-zoom-app-context header but it is not available in the clients 
  // So used supabase cookies set deep link to Zoom App in middleware file instead
  // Chanllenge: Not able to call decryptZoomAppContext on the client, consider using sever action function


  useEffect(() => {
    const initZoom = async () => {
      try {
        const configResponse = await zoomSdk.config({
          capabilities: [
            "authorize",
            "onAuthorized",
            "promptAuthorize",
            "getUserContext",
            "onMyUserContextChange",
            "openUrl",
          ],
        });

        console.log("✅ Zoom SDK configured:", configResponse.runningContext);

        // Zoom Apps Context
        // URL : https://developers.zoom.us/docs/zoom-apps/zoom-app-context/

        if (configResponse.runningContext === "inMainClient") {

          // Read the x-zoom-app-context value set by the middleware
          const zoomToken = getCookie("zoom_contet");
          console.log("Zoom Context Token:", zoomToken);

          // Decode then extact access_token and refresh_token from deeplinkToken
          // TypeError: undefined is not an object (evaluating 'e.length')

          // const decryptedAppContext = decryptZoomAppContext(zoomToken, process.env.ZOOM_CLIENT_SECRET)
          // console.log("Decrypted Zoom App Context:", decryptedAppContext);

          //_____----________---------_________---------------
          //  Auto-login with Supabase if token contains access/refresh token
          // Then call setSession with that information to log the user in within the Zoom App
          // URL : https://supabase.com/docs/reference/javascript/auth-setsession

          // if (decoded?.access_token && decoded?.refresh_token) {
          //   const supabase = createClient();
          //   supabase.auth.setSession({
          //     access_token: decoded.access_token,
          //     refresh_token: decoded.refresh_token,
          //   }).then(({ error }) => {
          //     if (error) {
          //       console.error("❌ Supabase session failed:", error.message);
          //     } else {
          //       console.log("✅ Supabase session set, redirecting to /dashboard");
          //       window.location.href = "/dashboard";
          //     }
          //   });
          // } else {
          //   console.error("❌ Missing access or refresh token");
          // }        

        }

        setIsConfigured(true);
        // Optional: add event listener here if not set elsewhere
        zoomSdk.addEventListener("onAuthorized", handleAuthorization);

      } catch (error) {
        console.error("❌ Error during Zoom SDK config:", error);
      }
    };

    initZoom();

    return () => {
      zoomSdk.removeEventListener("onAuthorized", handleAuthorization);
    };
  }, []);

  return (
    <>

      <p>You are on this route: {location}</p>
      <Button onClick={authorize} disabled={!isConfigured || authStatus === "loading"}>
        {authStatus === "loading" ? "Authorizing..." : "Authorize with Zoom"}
      </Button>

      {authStatus === "success" && <p>✅ Redirecting...</p>}
      {authStatus === "error" && <p className="text-red-600">❌ Login failed. Please try again.</p>}
    </>
  );
}