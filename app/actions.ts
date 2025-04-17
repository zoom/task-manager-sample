"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import zoomSdk from "@zoom/appssdk";
import {getDeeplink} from "@/app/lib/zoom-api";

export const signInWithZoomVoid = async () => {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin");

  console.log("Origin:", origin);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'zoom',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return encodedRedirect("error", "/sign-in", error.message);

  console.log("Zoom URL:", data.url);
  console.log("Zoom Data Response:", data);
  const urlObj = new URL(data.url);

  //  Use code challenge to authorize the zoom app
  const codeChallenge = urlObj.searchParams.get("code_challenge");
  console.log("Sign With In Zoom Code Challenge: ", codeChallenge);
  let authorizeResponse;
   // Call to zoom app config method
  try {

  // Call to zoom app authorize function

  // authorizeResponse = await (await fetch("/api/zoomapp/authorize")).json();
  // const { codeChallenge, state } = authorizeResponse;
  console.log(authorizeResponse);

  // const authorizeOptions = {
  //   codeChallenge: codeChallenge,
  //   state: state,
  // };
    
  } catch (error) {
    console.error(error);
    
  }
 
 


  // Call to zoom app onAuthorized function   
  
    // Then, call supabase.auth.onAuthStateChange to get the session
  
    // URL : https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession

  // const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  //return redirect(data.url);
  return data.url;
}

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