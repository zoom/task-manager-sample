import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {getDeeplink} from "@/app/lib/zoom-api";
import {redirect} from "next/navigation";
import {NextResponse} from "next/server";

export const createClient = async () => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
  );

  return supabase
};