import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";
import ProjectsContainer from "@/components/projects/projects-container";

export default async function DashboardPage() {
    const supabase = await createClient();

    


    return (
        <div className="flex flex-row w-full max-w-full">
            <ProjectsContainer/>
        </div>
    );
}
