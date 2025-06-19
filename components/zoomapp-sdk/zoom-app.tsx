"use client";

import { useEffect, useState, useRef } from "react";
import zoomSdk from "@zoom/appssdk";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "../ui/button";

import {signInWithZoomApp } from "@/app/actions";
import {getSupabaseUser } from "@/app/lib/token-store";

import { useSearchParams } from "next/navigation";
 
export default function ZoomAuth() {
  console.log("__________________________ Zoom App Home Page _______________________", "\n");
  const [isConfigured, setIsConfigured] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const location = usePathname();

  //get state from the URL
  const searchParams = useSearchParams();
  const state = searchParams?.get("state");
  console.log("🪵 State from query params:", state, "\n");

  // Reference for the onAuthorized listener
  const onAuthorizedRef = useRef<(event: any) => void>(() => {});

  // Zoom SDK configuration
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

      setIsConfigured(true);
      console.log("✅ Zoom SDK configured");
    } catch (error) {
      console.error("❌ Zoom SDK config error:", error);
    }
  };

  // One-time effect: initialize SDK and wire up listener
  useEffect(() => {
    // define handler
    const handler = (event: any) => {
      console.log("🎯 onAuthorized triggered", event);
      // call session hydration when Zoom in-client flow completes
      setAuthStatus("loading");
      handleSupabaseSession(event.state);
    };

    onAuthorizedRef.current = handler;
    zoomSdk.addEventListener("onAuthorized", handler);

    initializeZoomSDK();

    return () => {
      console.log("🧹 Cleaning up Zoom SDK event listener");
      zoomSdk.removeEventListener("onAuthorized", onAuthorizedRef.current);
    };
  }, []);

  // Only hydrate Supabase session when `state` param appears
  useEffect(() => {
    if (!state) return;
    console.log("✅ state is present, hydrating supabase session…");
    setAuthStatus("loading");
    handleSupabaseSession(state);
  }, [state]);

  // Shared hydration logic
  const handleSupabaseSession = async (cacheState: string) => {
    try {
      const tokenData = await getSupabaseUser(cacheState);
      console.log("🔐 Token data from Redis:", tokenData);

      if (!tokenData.accessToken || !tokenData.refreshToken) {
        console.error("❌ Token data incomplete.");
        setAuthStatus("error");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
      });

      if (error) {
        console.error("❌ Supabase session set error:", error.message);
        setAuthStatus("error");
        return;
      }

      console.log("✅ Supabase session set successfully from Redis cache.");
      setAuthStatus("success");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("❌ Failed to get Supabase tokens from cache:", err);
      setAuthStatus("error");
    }
  };

  // Zoom in-client flow
  const authorizeViaZoomClient = async () => {
    const code_challenge = "ZjBjMDdjYWEwODJkYjQ0NDZjNDEwODc0MzljYjA2ZGRlYTk3YzM0YmI3YzljZDVjNTcxOTI0NzMyODhhMmZhYg==";
    const hardcodedState = "TIA5UgoMte";

    try {
      setAuthStatus("loading");
      await zoomSdk.authorize({ codeChallenge: code_challenge, state: hardcodedState });
    } catch (error) {
      console.error("❌ Zoom SDK authorize error:", error);
      setAuthStatus("error");
    }
  };

  // Raw Supabase OAuth via external URL
  const handleRawSupabaseOAuth = async () => {
    try {
      setAuthStatus("loading");
      const { url } = await signInWithZoomApp();
      await zoomSdk.openUrl({ url });
      console.log("✅ Opened raw Supabase OAuth URL:", url);
      setAuthStatus("success");
    } catch (error) {
      console.error("❌ Error opening raw Supabase auth URL:", error);
      setAuthStatus("error");
    }
  };


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
