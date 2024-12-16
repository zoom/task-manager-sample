"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const signInWithZoom = async () => {
  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'zoom',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error)
    return encodedRedirect("error", "/sign-in", error.message);

  return redirect(data.url);
}

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};
