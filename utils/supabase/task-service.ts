
import { createClient } from "@/utils/supabase/client";

export async function deleteTask(taskId: number) {
  const supabase = createClient();
  // If you have a cascading foreign key, one delete is enough:
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  return error;
}
