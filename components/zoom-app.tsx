"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/router';
import zoomSdk from "@zoom/appssdk";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "./ui/button";

import {getSupabaseUser } from "@/app/lib/token-store";
import {signInWithZoomApp } from "@/app/actions";

import { useSearchParams } from "next/navigation";
 
export default function ZoomAuth() {
  console.log("__________________________ Zoom App Home Page _______________________", "\n");
  const [isConfigured, setIsConfigured] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const location = usePathname();

  //get state from the URL
  const searchParams = useSearchParams();
  const state = searchParams.get("state");
  console.log("🪵 State from query params:", state, "\n");

  // Ref to dynamically assign the correct onAuthorized handler
  const authorizedHandlerRef = useRef<(event: any) => void>(() => {});

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

 
  const handleZoomInClientAuthorization = async (event: any) => {
    console.log("📥 Zoom In-Client OAuth Authorization Event:", event);
    // Handle the Zoom In-Client authorization result here
    // You can exchange `event.code` with your backend if needed
    setAuthStatus("success");
  };

  const authorizeViaZoomClient = async () => {
     // OAuth PKCE values (normally you'd generate these securely)
    const code_challenge = "ZjBjMDdjYWEwODJkYjQ0NDZjNDEwODc0MzljYjA2ZGRlYTk3YzM0YmI3YzljZDVjNTcxOTI0NzMyODhhMmZhYg==";
    const hardcodedState = "TIA5UgoMte";

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

  const handleRawSupabaseOAuth = async () => {
    try {
      setAuthStatus("loading");
      const { url } = await signInWithZoomApp();
      await zoomSdk.openUrl({ url: url });
      console.log("✅ Opened raw Supabase OAuth URL:", url);
      setAuthStatus("success");
    } catch (error) {
      console.error("❌ Error opening raw Supabase auth URL:", error);
      setAuthStatus("error");
    }
  };

  const setSupabaseSessionFromCache = async () => {
    const hardcodedState = state;
  
    try {
      const tokenData = await getSupabaseUser(hardcodedState);
      console.log("🔐 Token data from Redis:", tokenData);
  
      if (!tokenData.accessToken || !tokenData.refreshToken) {
        console.error("❌ Token data incomplete.");
        return;
      }
  
      const supabase = createClient();
      const { data, error } = await supabase.auth.setSession({
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
      });
  
      if (error) {
        console.error("❌ Supabase session set error:", error.message);
        return;
      }
  
      console.log("✅ Supabase session set successfully from Redis cache.");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("❌ Failed to get Supabase tokens from cache:", err);
    }
  };
  
  useEffect(() => {
    initializeZoomSDK();
    // setSupabaseSessionFromURL();
    setSupabaseSessionFromCache();
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


        <Button onClick={handleRawSupabaseOAuth} disabled={!isConfigured || authStatus === "loading"}>
          {authStatus === "loading" ? "Authorizing..." : "Authorize with Raw Supabase URL"}
        </Button>
      </div>

      {authStatus === "success" && <p>✅ Redirecting...</p>}
      {authStatus === "error" && <p className="text-red-600">❌ Login failed. Please try again.</p>}
    </>
  );
}
