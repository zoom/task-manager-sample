import { createClient } from '@/utils/supabase/client';
import type { Tables } from '@/lib/types';
import Tasks from '@/components/taskmanger/tasks';

type Task = Tables<'tasks'>;

async function getProjectTasks(projectId: string): Promise<Task[]> {
    const supabase = await createClient(); 
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId); 

        // console.log('Supabase Tasks:', tasks);

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }

    return tasks || [];
}

export default async function Page({
  params,
}: {
  params: { projectId: string };
}) {
    const awaitedParams = await params;  
    const { projectId } = awaitedParams;
    const tasks = await getProjectTasks(projectId);

    return tasks.length > 0 ? (
        <Tasks tasks={tasks} />
    ) : (
        <div className="p-4 text-center">
            <p>No tasks found for this project.</p>
        </div>
    );
}
