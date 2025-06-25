'use client';

import { useRef, useState, useEffect, ChangeEvent } from "react";
import zoomSdk from "@zoom/appssdk";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { getSupabaseUserbyId, getSupabaseUser } from "@/app/lib/token-store";
import { createClient } from "@/utils/supabase/client";


interface ChatContext {
    toJid: string;
    userJid: string;
    threadId?: string;
}

export default function ZoomCardPage() {
    const [meetingId, setMeetingId] = useState("97231146424");
    const [shareUrl, setShareUrl] = useState(" https://saveoj.us");
    const [bitmap, setBitmap] = useState("Placeholder for bitmap");
    const [chatContext, setChatContext] = useState<ChatContext | null>(null);
    const [error, setError] = useState<string | null>(null);
    const hasRedirected = useRef(false);

    const [textareaMessage, setTextareaMessage] = useState("");


    // ✅ Configure Zoom SDK on mount
    useEffect(() => {
        zoomSdk.config({
            capabilities: [
                "getChatContext",
                "composeCard",
                "sendMessageToChat",
                "getRunningContext"
            ],
            version: "0.16.0",
        });

        if (!hasRedirected.current) {
            getSupabaseSessionFromCache();
        }
    }, []);


    const getSupabaseSessionFromCache = async () => {
        try {

            // Make sure this value is retrieved dyncamically or set appropriately
            const userId = 'vbDj8eUxRduts0tAN29trA'

            // Get latest state for this user
            const state = await getSupabaseUserbyId(userId);
            console.log("🔑 Retrieved state for user:", state);

            // 🔐 Fetch token data using the retrieved state
            const tokenData = await getSupabaseUser(state);
            console.log("🔐 Retrieved Supabase Provider Token:", tokenData);

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
            hasRedirected.current = true;

        } catch (err) {
            console.error("❌ Failed to get Supabase tokens from cache:", err);
        }
    };


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "meetingId") setMeetingId(value);
        if (name === "shareUrl") setShareUrl(value);
        if (name === "bitmap") setBitmap(value);
    };

    const sendZoomCard = async () => {
        try {
            const content = {
                content: {
                    head: { type: "message", text: `Meeting ID: ${meetingId}` },
                    body: [
                        {
                            type: "message",
                            text: `Share Recording URL: ${shareUrl}`,
                        },
                    ],
                },
            };

            const message = JSON.stringify(content);

            const res = await fetch("/api/zoom/sign-card", {
                method: "POST",
                body: JSON.stringify({ message }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { signature, timestamp } = await res.json();
            console.log("Signature and Timestamp:", signature, timestamp);

            const card = {
                type: "interactiveCard",
                message,
                signature,
                timestamp,
                previewCard: JSON.stringify({
                    title: `Meeting ID: ${meetingId}`,
                    description: `Share URL: ${shareUrl}`,
                    icon: {
                        bitmap,
                    },
                }),
            };

            const cardcompose = await zoomSdk.composeCard(card);
            if (cardcompose) {
                console.log("Card composed successfully");
                window.close();
            } else {
                console.error("Failed to compose card");
            }

        } catch (e: any) {
            console.error("Error creating preview card", e);
            setError(e.message || "Unknown error");
        }
    };

    const sendZoomTextMessage = async () => {
        try {
            if (!textareaMessage.trim()) {
                setError("Message cannot be empty.");
                return;
            }

            await zoomSdk.sendMessageToChat({ message: textareaMessage });
            console.log("✅ Message sent to chat.");
            setTextareaMessage("");
            window.close();
        } catch (e: any) {
            console.error("❌ Failed to send message:", e);
            setError(e.message || "Unknown error while sending chat message.");
        }
    };


    return (
        <div className="max-w-xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Zoom Meeting Card Generator</h1>

            {error && (
                <div className="text-red-600 bg-red-50 border border-red-300 p-4 rounded">
                    Error: {error}
                </div>
            )}

            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-1">
                        <Label htmlFor="meetingId">Meeting ID</Label>
                        <Input
                            id="meetingId"
                            name="meetingId"
                            value={meetingId}
                            onChange={handleInputChange}
                            placeholder="Enter Meeting ID"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="shareUrl">Share URL</Label>
                        <Input
                            id="shareUrl"
                            name="shareUrl"
                            value={shareUrl}
                            onChange={handleInputChange}
                            placeholder="Enter Share URL"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="bitmap">Bitmap</Label>
                        <Input
                            id="bitmap"
                            name="bitmap"
                            value={bitmap}
                            onChange={handleInputChange}
                            placeholder="Enter bitmap string or URL"
                        />
                    </div>

                    <Button onClick={sendZoomCard} className="w-full">
                        Generate Zoom Card
                    </Button>
                </CardContent>
            </Card>

            {chatContext && (
                <div>
                    <h2 className="text-lg font-semibold mb-2">Chat Context:</h2>
                    <pre className="bg-muted p-4 rounded text-sm whitespace-pre-wrap border border-muted-foreground/20">
                        {JSON.stringify(chatContext, null, 2)}
                    </pre>
                </div>
            )}
            <Card>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-1">
                        <Label htmlFor="chatMessage">Send Chat Message</Label>
                        <textarea
                            id="chatMessage"
                            value={textareaMessage}
                            onChange={(e) => setTextareaMessage(e.target.value)}
                            placeholder="Enter a message to send to chat"
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                        />
                    </div>
                    <Button onClick={sendZoomTextMessage} className="w-full">
                        Send to Chat
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
