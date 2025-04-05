"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

import { getDeeplink } from "@/app/lib/zoom-api";
import { redirect } from "next/navigation";

export const getZoomSignInUrl = async (): Promise<string> => {
    const supabase = await createClient();
    const headerList = await headers(); // await the headers() call
    const origin = headerList.get("origin") ?? "";

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "zoom",
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    // Fetch the Supabase session securely
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
        console.error("Session error:", sessionError);
        redirect("/login");
    }

    // const accessToken = sessionData.session.provider_token ?? "";
    // console.log("Access Token User Server", accessToken);
    // const deeplink = await getDeeplink(accessToken);


    // Triggers Deep Link Flow To Zoom App On Auth State Change
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.provider_token) {
            const deeplink = await getDeeplink(session.provider_token);

            console.log("Deeplink-Auth: ", deeplink)

            // Uncomment the line below to redirect to the deeplink URL
            if (deeplink) {
                return redirect(deeplink);
            } else {
                console.error("Deeplink is undefined");
                redirect("/error"); // Redirect to an error page or handle appropriately
            }

        }
    })


    // Return the sign-in URL instead of performing a redirect
    // return redirect(deeplink); 
    return data.url;
};
