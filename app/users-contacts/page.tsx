// app/users-contacts/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getuserContacts, getuserChannels } from "@/app/lib/teamchat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import zoomSdk from "@zoom/appssdk";

export default function UsersClientPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [authNeeded, setAuthNeeded] = useState(false);
  const [authStatus, setAuthStatus] = useState<"idle" | "loading" | "error">("idle");

  // ref for cleanup of Zoom listener
  const zoomHandlerRef = useRef<(event: any) => void>();

  // Fetch contacts when we have a provider token
  const fetchTeamChatData = async (providerToken: string) => {
    try {
      const contactsResp = await getuserContacts(providerToken);
      const channelsResp = await getuserChannels(providerToken);
      setUsers(contactsResp.contacts);
      setChannels(channelsResp);
    } catch (err) {
      console.error("Failed to fetch team chat data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Zoom event listener once
  useEffect(() => {
    const handler = (event: any) => {
      console.log("🎯 Zoom onAuthorized event:", event);
      // exchange event.code and event.state for tokens via your API
      (async () => {
        setAuthStatus("loading");
        try {
          // POST to backend to exchange code for Zoom tokens and set Supabase session
          const res = await fetch('/api/zoom/inclient-auth', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code: event.code, state: event.state })
          });
          if (!res.ok) throw new Error('OAuth exchange failed');
          const { providerToken } = await res.json();

          // now fetch the contacts
          await fetchTeamChatData(providerToken);
          setAuthStatus("idle");
        } catch (e) {
          console.error(e);
          setAuthStatus("error");
        }
      })();
    };
    zoomHandlerRef.current = handler;
    zoomSdk.addEventListener("onAuthorized", handler);

    return () => {
      if (zoomHandlerRef.current) {
        zoomSdk.removeEventListener("onAuthorized", zoomHandlerRef.current);
      }
    };
  }, []);

  // On mount, check Supabase session and provider_token
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        router.push('/login');
        return;
      }
      const providerToken = data.session.provider_token;
      if (providerToken) {
        // we already have a Zoom token
        fetchTeamChatData(providerToken);
      } else {
        // need to initialize Zoom OAuth in-client
        setAuthNeeded(true);
        await zoomSdk.config({
          capabilities: [
            "authorize",
            "onAuthorized",
            "promptAuthorize"
          ],
        });
        setLoading(false);
      }
    })();
  }, [supabase, router]);

  const startZoomOAuth = async () => {
    setAuthStatus("loading");
    try {
      // Manually set the code challenge and state for testing
      // In production, these should be dynamically generated
      // and securely stored in your backend or environment variables
      // This is just a placeholder; replace with your actual code challenge logic
      const code_challenge = "ZDdkZmFkYjE4MzZmZjYzOWJiZjg0NTY0ZDMxYjA4YmU2YWQ1NTAyOTBlMWQ5YThhOWU4MDMzMmRkYzI4YzdmOQ==";
      const state = "TIA5UgoMte";
      await zoomSdk.authorize({ state, codeChallenge: code_challenge });
      setAuthStatus("idle");
      setAuthNeeded(false);
    } catch (e) {
      console.error('Zoom authorize error', e);
      setAuthStatus('error');
    }
  };

  if (loading) return <p>Loading…</p>;

  if (authNeeded) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="mb-2">Connect your Zoom account to view contacts</p>
        <Button onClick={startZoomOAuth} disabled={authStatus === 'loading'}>
          {authStatus === 'loading' ? 'Authorizing…' : 'Authorize via Zoom'}
        </Button>
        {authStatus === 'error' && <p className="text-red-600 mt-2">Authorization failed</p>}
      </div>
    );
  }


  return (
    <div className="flex">
      <div className="w-1/2 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <div className="space-y-4">
          {users.map((u) => (
            <Card key={u.id} className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>
                  {u.first_name} {u.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Email: {u.email}</p>
                <p>Phone: {u.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">User Channels</h2>
        <div className="space-y-4">
          {channels.map((c) => (
            <Card key={c.id} className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Type: {c.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
