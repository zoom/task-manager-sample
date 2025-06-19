// app/api/zoom/oauth/route.ts
import { NextResponse } from "next/server";
import { getZoomAccessTokenRaw } from "@/app/lib/zoom-api";

export async function POST(request: Request) {
  // Parse code and state from JSON body
  const { code, state } = await request.json();

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing `code` or `state` in request body" },
      { status: 400 }
    );
  }
  
  try {
    console.log("\n",'2. InClient OAuth: Getting Zoom access token and user------------',"\n");
    // Replace with your actual code_verifier logic or retrieval from state store 
    const verifier = "arandomstring123";
    console.log("> State and Code values for token exchange:", state, code);
    // This returns the token JSON directly, not a Response
    const tokenData = await getZoomAccessTokenRaw(code, verifier);

    console.log("Zoom token data:", tokenData);

    // tokenData.access_token / refresh_token / expires_in, etc.
    return NextResponse.json({ providerToken: tokenData.access_token });
  } catch (err: any) {
    console.error("> Zoom token exchange error:", err);
    // If Zoom replied 400, getZoomAccessTokenRaw already logged the body
    return NextResponse.json(
      { error: err.message || "Token exchange failed" },
      { status: 500 }
    );
  }
}
