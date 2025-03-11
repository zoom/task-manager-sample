import { getuserContacts, getuserChannels } from "@/src/services/zoom/teamchat";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type User = {
  id: number;
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
  console.log("User Contacts List:", users);

  // Get the channels list
  const channelResponse = await getuserChannels(accessToken);
  const channels: Channels[] = channelResponse;
  console.log("Channel List:", channels);

  return (
    <div className="flex">
      {/* Left Column - Channel List */}
      <div className="w-1/2 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user.id}
              className="p-4 bg-white shadow-md rounded-lg text-gray-700"
            >
              <div className="font-bold">{user.first_name}</div>
              <div className="text-sm">
                <div>Lastname: {user.last_name}</div>
                <div>Email: {user.email}</div>
              </div>
            </li>
          ))}
        </ul>

        

      </div>

      {/* Right Column - User List */}
      <div className="w-1/2 p-4">
        <h2 className="text-xl font-bold mb-4">User Channels</h2>

        <ul className="space-y-4">
          {channels.map((channel) => (
            <li
              key={channel.id}
              className="p-4 bg-white shadow-md rounded-lg text-gray-700"
            >
              <div className="font-bold">{channel.name}</div>
              <div className="text-sm">
                <div>Type: {channel.type}</div>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
