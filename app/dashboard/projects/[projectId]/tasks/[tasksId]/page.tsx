import TaskDetails from '@/components/taskmanger/task-details';
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Tables } from '@/lib/types'
type Task = Tables<'tasks'>

async function getTaskDetails(projectId: string, taskId: string): Promise<Task | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => (await cookieStore).getAll(),
        },
      }
    );

    // Fetch task details from Supabase
    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("id", taskId)
      .single();

    if (error) {
      console.error("Error fetching task details:", error);
      return null;
    }

    return task;
  } catch (err) {
    console.error("Unexpected error:", err);
    return null;
  }
}

export default async function Page({ params }: { params: { projectId: string; tasksId: string } }) {
  const { projectId, tasksId } = await params;
  const task = await getTaskDetails(projectId, tasksId);

  if (!task) {
    return <div>Task not found</div>;
  }

  return <TaskDetails task={task} />;
}