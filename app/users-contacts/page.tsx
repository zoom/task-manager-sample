import { getuserContacts, getuserChannels } from "@/app/lib/teamchat";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type User = {
  id: string;
  member_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type Channels = {
  id: number;
  name: string;
  type: string;
};

export default async function UsersServer() {
  // Optionally remove the delay if not needed
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Get cookies and create the Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  // Fetch the Supabase session securely
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session) {
    console.error("Session error:", sessionError);
    redirect("/login");
  }

  const accessToken = sessionData.session.provider_token ?? "";
  console.log("Access Token User Server", accessToken);

  // Get the users list
  const response = await getuserContacts(accessToken);
  const users: User[] = response.contacts;
  console.log("Users:", users);

  // Upsert the Zoom user data into the zoom_users table
  const { error: upsertError } = await supabase
    .from("zoom_users")
    .upsert(
      users.map((user) => ({
        id: user.id,
        member_id: user.member_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      }))
    );
  if (upsertError) {
    console.error("Upsert error:", upsertError);
  }

  // Get the channels list
  const channelResponse = await getuserChannels(accessToken);
  const channels: Channels[] = channelResponse;

  return (
    <div className="flex">
      {/* Left Column - Users */}
      <div className="w-1/2 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>
                  {user.first_name} {user.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Email: {user.email}</p>
                <p>Phone: {user.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Column - Channels */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">User Channels</h2>
        <div className="space-y-4">
          {channels.map((channel) => (
            <Card key={channel.id} className="shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>{channel.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Type: {channel.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}