import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getDeeplink } from "@/app/lib/zoom-api";
import { redirect } from "next/navigation";


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  console.log("🔗 Request URL Auth Route:", request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'


  if (code) {
    const supabase = await createClient()
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const forwardedHost = "https://" + request.headers.get('x-forwarded-host')
    
    console.log("🔍 Extracted Auth Code:", code, '\n')
    console.log("🔗 Forward Host Path:", forwardedHost, '\n')

    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
   
    if (error) {
      console.error(error);
      return NextResponse.redirect(`${forwardedHost}/error`)
    }
    // Triggers Deep Link Flow To Zoom App On Auth State Change
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.provider_token) {

        // const deeplink = await getDeeplink(session.provider_token);

        // console.log("Deeplink-Route: ", deeplink, '\n')
        // Uncomment the line below to redirect to the deeplink URL
        // return redirect(deeplink); 
      }
    })

    console.log("Exchange Code For Session:", data,'\n')

    // When in a local dev environment we may be using Ngrok so we need to check the x-forwarded-host
    if (isLocalEnv) {
      console.log("🔗 Redirecting to Ngrok Forwarded Host:", forwardedHost)
      return NextResponse.redirect(`${forwardedHost}${next}`)
    } else {
      console.log("🔗 Redirecting to Origin:", origin)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
}