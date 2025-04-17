"use client";

import { useEffect, useState } from "react";
import zoomSdk from "@zoom/appssdk";
import { createClient } from '@/utils/supabase/client';

import { Button } from "./ui/button";


export default function ZoomAuth() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error" | "loading">("idle");

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

    try {
      const res = await fetch(`/auth/callback/zoomapp?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`, {
        method: "GET",
        credentials: "include",
      });

      const json = await res.json();

      const { access_token, refresh_token, redirect_url } = json;

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });

      if (error) {
        console.error("❌ Supabase session error:", error);
        setAuthStatus("error");
      } else {
        setAuthStatus("success");
        window.location.href = redirect_url || next;
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setAuthStatus("error");
    }
  };

  // Configure the Zoom SDK
  useEffect(() => {
    zoomSdk.config({
      capabilities: ["authorize", "onAuthorized"],
    }).then(() => {
      zoomSdk.addEventListener("onAuthorized", handleAuthorization);
      setIsConfigured(true);
    });

    return () => {
      zoomSdk.removeEventListener("onAuthorized", handleAuthorization);
    };
  }, []);

  return (
    <>
      <Button onClick={authorize} disabled={!isConfigured || authStatus === "loading"}>
        {authStatus === "loading" ? "Authorizing..." : "Authorize with Zoom"}
      </Button>

      {authStatus === "success" && <p>✅ Redirecting...</p>}
      {authStatus === "error" && <p className="text-red-600">❌ Login failed. Please try again.</p>}
    </>
  );
}