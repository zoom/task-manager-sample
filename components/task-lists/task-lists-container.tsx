import {createClient} from "@/utils/supabase/server";
import {TaskListsClient} from "@/components/task-lists/task-lists-client";

import type { Tables } from '@/lib/types'
type TaskList = Tables<'task_lists'>


export default async function TaskListsContainer() {
    const supabase = await createClient();

   const { data: taskLists, error } = await supabase
        .from('task_lists')
        .select(`
      id,
      name,
      tasks(*)
    `)
        .returns<TaskList[]>()


    if (error) {
        console.error('Error fetching task lists:', error)
        return <div>Error loading task lists. Please try again later.</div>
    }


    if (error) {
        console.error('Error fetching task lists:', error)
        return <div>Error loading task lists. Please try again later.</div>
    }


    return <TaskListsClient taskLists={taskLists || []} />
}