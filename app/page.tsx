import Hero from '@/components/hero'
import {headers} from "next/headers";
import dynamic from "next/dynamic";


export default async function Page() {
    let Zoom;

    const headersList = await headers();
    const isZoom = headersList.has('x-zoom-app-device-type');

    const loadZoom = () => {
        if (!isZoom) return;

        Zoom = dynamic(() => import('@/components/zoom'));

        return (<Zoom/>)
    }


    return (
        <div>
            <Hero></Hero>
            {loadZoom()}
        </div>
    )
}