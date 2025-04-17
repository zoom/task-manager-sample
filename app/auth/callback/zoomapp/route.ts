

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from "next/server";
import { getToken } from "@/app/lib/zoom-api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const origin = url.origin;

  // Must match the one used to generate challenge
  const code_verifier = "fr4O07RDpEBQQzbgKK3sIP7ePRU5YIhdb5lTfVAoLU4";

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const token = await getToken(code, code_verifier);
    console.log("✅ Zoom token request success:", token);

    return NextResponse.json({
      success: true,
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      redirect_url: next,
    });
  } catch (error: any) {
    console.error("❌ Zoom token exchange failed:", error?.response?.data || error.message);
    return NextResponse.json({ error: "Token exchange failed" }, { status: 500 });
  }
}
