// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error);
      return;
    }
    // hide your sidebar immediately via onAuthStateChange…
    // then force a full reload:
    window.location.replace("/");
  };

  return <button onClick={onLogout}>Log out</button>;
}
