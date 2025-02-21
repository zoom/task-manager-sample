
"use client"
import { useEffect, useState } from "react";
import ZoomComponent from "@/components/zoom/ZoomComponent";
import { createClient } from "@/utils/supabase/client";

export default function ZoomPage() {
  const supabase = createClient();
  const [zoomAccessToken, setZoomAccessToken] = useState<string | null>(null);

  useEffect(() => {
   
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }
      if (data?.session?.provider_token) {

        console.log("Access Token", data.session.provider_token);
        setZoomAccessToken(data.session.provider_token);
      }
    };

    fetchSession();
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen h-screen">
      <div className="flex flex-col items-center justify-center w-full max-w-lg p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Zoom Meetings</h1>

        <ZoomComponent />
      </div>
    </main>
  );
}
