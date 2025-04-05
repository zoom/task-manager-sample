import Hero from '@/components/hero'
import {headers} from "next/headers";
import dynamic from "next/dynamic";

import SignInWithZoomButton from '@/components/taskmanger/zoom-app-signin-btn';


export default async function Page() {
    let Zoom;

    const headersList = await headers();
    const isZoom = headersList.has('x-zoom-app-device-type');

    const loadZoomApp = () => {
        if (!isZoom) return  <SignInWithZoomButton/>;

        Zoom = dynamic(() => import('@/components/zoom-app'));

        return (<Zoom/>)
    }

    return (
        <div>
            <Hero></Hero>
            {loadZoomApp()}
           
        </div>
    )
}