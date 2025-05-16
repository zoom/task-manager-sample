"use client";

import { useEffect, useState, useRef } from "react";
import zoomSdk from "@zoom/appssdk";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";
import { signInWithZoomApp } from "@/app/actions";
 
export default function ZoomAuth() {
  console.log("__________________________ Zoom App Home Page _______________________", "\n");
  const [isConfigured, setIsConfigured] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const location = usePathname();

  // Ref to dynamically assign the correct onAuthorized handler
  const authorizedHandlerRef = useRef<(event: any) => void>(() => {});

  // OAuth PKCE values (normally you'd generate these securely)
  const code_challenge = "ZjBjMDdjYWEwODJkYjQ0NDZjNDEwODc0MzljYjA2ZGRlYTk3YzM0YmI3YzljZDVjNTcxOTI0NzMyODhhMmZhYg==";
  const hardcodedState = "TIA5UgoMte";

  const handleZoomInClientAuthorization = async (event: any) => {
    console.log("📥 Zoom In-Client OAuth Authorization Event:", event);
    // Handle the Zoom In-Client authorization result here
    // You can exchange `event.code` with your backend if needed
    setAuthStatus("success");
  };

  const handleSupabaseZoomOAuth = async () => {
    try {
      setAuthStatus("loading");
      const { url, error } = await signInWithZoomApp();

      if (error || !url) {
        console.error("❌ Failed to get Supabase OAuth URL:", error);
        setAuthStatus("error");
        return;
      }

      await zoomSdk.openUrl({ url });
      console.log("✅ Opened Supabase Zoom OAuth URL:", url);
      setAuthStatus("success");
    } catch (err) {
      console.error("❌ Error during Supabase Zoom OAuth flow:", err);
      setAuthStatus("error");
    }
  };

  const handleRawSupabaseOAuth = async () => {
    try {
      setAuthStatus("loading");

      const supabaseProjectRef = "svkmdyqdhpvqvgyosxmc";
      const zoomAppRedirect = `${window.location.origin}/zoom/launch`;
      const supabaseAuthUrl = `https://${supabaseProjectRef}.supabase.co/auth/v1/authorize?provider=zoom&redirect_to=${encodeURIComponent(zoomAppRedirect)}`;

      await zoomSdk.openUrl({ url: supabaseAuthUrl });
      console.log("✅ Opened raw Supabase OAuth URL:", supabaseAuthUrl);
      setAuthStatus("success");
    } catch (error) {
      console.error("❌ Error opening raw Supabase auth URL:", error);
      setAuthStatus("error");
    }
  };

  const authorizeViaZoomClient = async () => {
    try {
      authorizedHandlerRef.current = handleZoomInClientAuthorization;
      setAuthStatus("loading");

      await zoomSdk.authorize({
        codeChallenge: code_challenge,
        state: hardcodedState,
      });
    } catch (error) {
      console.error("❌ Zoom SDK authorize error:", error);
      setAuthStatus("error");
    }
  };

  const initializeZoomSDK = async () => {
    try {
      await zoomSdk.config({
        capabilities: [
          "authorize",
          "onAuthorized",
          "promptAuthorize",
          "getUserContext",
          "onMyUserContextChange",
          "openUrl",
        ],
      });

      zoomSdk.addEventListener("onAuthorized", (event) => {
        console.log("🎯 onAuthorized triggered", event);
        authorizedHandlerRef.current(event);
      });

      setIsConfigured(true);
      console.log("✅ Zoom SDK configured");
    } catch (error) {
      console.error("❌ Zoom SDK config error:", error);
    }
  };

  const setSupabaseSessionFromURL = async () => {
    const urlParams = new URLSearchParams(window.location.search);
  
    const access_token = urlParams.get("access_token");
    const refresh_token = urlParams.get("refresh_token");
  
    if (!access_token || !refresh_token) {
      console.log("ℹ️ No Supabase tokens found in URL.");
      return;
    }
  
    console.log("🔐 Found tokens in URL, setting Supabase session...");
  
    const supabase = createClient();
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
  
    if (error) {
      console.error("❌ Zoom App Home Page - Failed to set Supabase session:", error.message);
      setAuthStatus("error");
      return;
    }
  
    console.log("✅ Supabase session set successfully Home Page:", data);
    setAuthStatus("success");
  
    // Optional: Clean up URL by removing tokens after setting the session
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("access_token");
    newUrl.searchParams.delete("refresh_token");
    window.history.replaceState({}, document.title, newUrl.toString());
  };
  



  useEffect(() => {
    initializeZoomSDK();
    setSupabaseSessionFromURL();
    return () => {
      console.log("🧹 Cleaning up Zoom SDK event listeners:", authorizedHandlerRef.current);
      // zoomSdk.removeEventListener("onAuthorized", authorizedHandlerRef.current);
      
    };
  }, []);

  return (
    <>
      <p>You are on this route: {location}</p>

      <div className="flex flex-col gap-3 mt-4">
        <Button onClick={authorizeViaZoomClient} disabled={!isConfigured || authStatus === "loading"}>
          {authStatus === "loading" ? "Authorizing..." : "Authorize with Zoom In-Client Flow"}
        </Button>

        <Button onClick={handleSupabaseZoomOAuth} disabled={!isConfigured || authStatus === "loading"}>
          {authStatus === "loading" ? "Authorizing..." : "Authorize with Supabase via Server Action"}
        </Button>

        <Button onClick={handleRawSupabaseOAuth} disabled={!isConfigured || authStatus === "loading"}>
          {authStatus === "loading" ? "Authorizing..." : "Authorize with Raw Supabase URL"}
        </Button>
      </div>

      {authStatus === "success" && <p>✅ Redirecting...</p>}
      {authStatus === "error" && <p className="text-red-600">❌ Login failed. Please try again.</p>}
    </>
  );
}
