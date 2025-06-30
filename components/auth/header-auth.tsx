
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { UserNav } from "@/components/auth/user-nav";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

import { signInWithZoom } from "@/app/actions";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = await headers();
  const isZoom = headersList.has("x-zoom-app-device-type");

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge
          variant={"default"}
          className="font-normal pointer-events-none"
        >
          Please update .env.local file with anon key and url
        </Badge>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <UserNav />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {!isZoom && (
        <Button onClick={signInWithZoom}>
          Sign in With Zoom
        </Button>
      )}
    </div>
  );
}
