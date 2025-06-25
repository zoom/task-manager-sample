"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

export const signInWithZoomApp = async () => {
  const headerList = await headers();
  const origin = headerList.get("origin");

  // Generate state add to the URL
  const state = crypto.randomBytes(12).toString("hex"); 
  console.log("\n","Generated state for third-party Auth:", state, '\n');
  const zoomAppRedirect = `${origin}/zoom/launch?state=${state}`;
  const supabaseAuthUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=zoom&redirect_to=${encodeURIComponent(zoomAppRedirect)}`;
  
  return { url: supabaseAuthUrl };
};

export const signInWithZoom= async () => {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin");
 
  console.log("Origin:", origin, '\n');
  console.log('Headers:', headerList), '\n';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'zoom',
    options: {
      skipBrowserRedirect: true,
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error)
    return encodedRedirect("error", "/sign-in", error.message);
 
  console.log("Zoom URL:", data.url);
 
  return redirect(data.url);
  
}


export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  return redirect("/");
};