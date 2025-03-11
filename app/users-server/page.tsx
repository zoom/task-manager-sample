import { getuserContacts } from "@/src/services/zoom/teamchat";
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

export default async function UsersServer() {
  // Optionally remove the delay if not needed
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Get cookies and await the result
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

  const response = await getuserContacts(accessToken);
  const users: User[] = response.contacts;
  console.log("User Contacts List:", users);

  return (
    <ul className="space-y-4 p-4">
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
  );
}
