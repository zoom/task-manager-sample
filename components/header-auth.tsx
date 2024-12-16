import { signInWithZoom } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { UserNav } from "@/components/user-nav"
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
        </div>
      </>
    );
  }
  return user ? (
      <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
              <UserNav/>
          </div>
      </div>
  ) : (
      <div className="flex gap-2">
          <Button onClick={signInWithZoom}>
              Sign in With Zoom
          </Button>
      </div>
  );
}
