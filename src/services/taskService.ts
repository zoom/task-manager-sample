// /src/services/taskService.ts
import { createClient } from "@/utils/supabase/client";

export async function deleteTask(taskId: number) {
  const supabase = createClient();
  // If you have a cascading foreign key, one delete is enough:
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);
  
  // Otherwise, you may need to delete subtasks first:
  // const { error: subtaskError } = await supabase.from("sub_tasks").delete().eq("task_id", taskId);
  // if (subtaskError) return subtaskError;
  // const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  return error;
}
