"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInWithZoom= async () => {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin");

  console.log("Origin:", origin);

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

export const signInWithZoomApp = async () => {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin");
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "zoom",
    options: {
      skipBrowserRedirect: true,
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("OAuth Error:", error.message);
    return { error: error.message, url: null, codeChallenge: null };
  }

  const urlObj = new URL(data.url);
  const codeChallenge = urlObj.searchParams.get("code_challenge");

   console.log("Supabase Code Challenge: ", codeChallenge)

  return {
    url: data.url,
    codeChallenge,
    error: null,
  };
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};