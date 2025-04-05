import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {getDeeplink} from "@/app/lib/zoom-api";
import {redirect} from "next/navigation";


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'


  if (code) {
    const supabase = await createClient()
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const forwardedHost = "https://" + request.headers.get('x-forwarded-host')

    console.log('Forwarded Host:', forwardedHost)

    // Triggers Deep Link Flow To Zoom App On Auth State Change
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.provider_token) {
        const deeplink = await getDeeplink(session.provider_token);

        console.log("Deeplink-Route: ", deeplink)

        // Uncomment the line below to redirect to the deeplink URL
        // return redirect(deeplink); 

      }
    })

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error(error);
      return NextResponse.redirect(`${forwardedHost}/error`)
    }

    // When in a local dev environment we may be using Ngrok so we need to check the x-forwarded-host
    if (isLocalEnv)
      return NextResponse.redirect(`${forwardedHost}${next}`)
    else
      return NextResponse.redirect(`${origin}${next}`)
  }
}