import Hero from '@/components/hero'
import {headers} from "next/headers";
import dynamic from "next/dynamic";

import SignInWithZoomButton from '@/components/taskmanger/zoom-app-signin-btn';

import { signInWithZoomApp } from "@/app/actions";


export default async function Page() {
    let Zoom;

    // Remove the hardcoded code_challenge and url
    const { codeChallenge, url, error } = await signInWithZoomApp();


    const headersList = await headers();
    const isZoom = headersList.has('x-zoom-app-device-type');

    const loadZoomApp = () => {
        if (!isZoom) return  <SignInWithZoomButton/>;

        Zoom = dynamic(() => import('@/components/zoom-app'));

        return (codeChallenge && <Zoom />)
    }

    return (
        <div>
            <Hero></Hero>
            
            {loadZoomApp()}
           
        </div>
    )
}