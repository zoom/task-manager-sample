import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function verifyOtp(email: string, otp: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: "email", 
  });

  if (error) {
    console.error("Error verifying OTP:", error);
    return null;
  }

  if (!data.session) {
    console.error("No session returned after OTP verification.");
    return null;
  }

  console.log("User session:", data.session);

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });

  if (sessionError) {
    console.error("Session Error:", sessionError);
    return null;
  }

  return data.session; 
}


export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session || null;
}


export async function signOut() {
  await supabase.auth.signOut();
}
