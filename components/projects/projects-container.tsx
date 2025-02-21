import {createClient} from "@/utils/supabase/server";
import {ProjectsClient} from "@/app/dashboard/projects/projects-client";

import type { Tables } from '@/lib/types'
type Project = Tables<'projects'>


export default async function ProjectsContainer() {
    const supabase = await createClient();

   const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          tasks(*)
        `)
        .returns<Project[]>()


    if (error) {
        console.error('Error fetching task lists:', error)
        return <div>Error loading task lists. Please try again later.</div>
    }


    if (error) {
        console.error('Error fetching task lists:', error)
        return <div>Error loading task lists. Please try again later.</div>
    }

    // console.log('Listed Projects: ', projects);


    return <ProjectsClient projects={projects || []} />
}