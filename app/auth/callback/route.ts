import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'


  if (code) {
    const supabase = await createClient()
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const forwardedHost = "https://" + request.headers.get('x-forwarded-host')

    console.log('forwardedHost', forwardedHost)

    const { error } = await supabase.auth.exchangeCodeForSession(code)
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