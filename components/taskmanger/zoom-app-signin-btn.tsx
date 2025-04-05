"use client";

import { useEffect, useTransition } from "react";
import { getZoomSignInUrl } from "@/app/lib/zoomapp-auth-btn-server";
import { createClient } from "@/utils/supabase/client";
import { getDeeplink } from "@/app/lib/zoom-api";
import { useRouter } from "next/navigation";

export default function SignInWithZoomButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  // Listen for auth state changes to trigger the deep link flow.
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.provider_token) {
        const deeplink = await getDeeplink(session.provider_token);
        console.log("Deeplink-Button:", deeplink);
        // Open the deep link in a new tab.
        window.open(deeplink);
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignIn = async () => {
    startTransition(async () => {
      try {
        // Get the Zoom sign-in URL from the server action.
        const zoomUrl = await getZoomSignInUrl();
        console.log("Zoom URL:", zoomUrl);
        // Open the sign-in URL in a new tab.
        window.open(zoomUrl);
      } catch (error) {
        console.error("Error fetching Zoom sign-in URL:", error);
      }
    });
  };

  return (
    <button 
      onClick={handleSignIn} 
      disabled={isPending}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Sign in with Zoom App
    </button>
  );
}
