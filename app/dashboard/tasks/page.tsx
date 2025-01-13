import Tasks from "@/components/taskmanger/Tasks";
import {Tables} from "@/lib/types"

async function getTasks(): Promise<Tables<'Tasks'>[]> {
/*  const supabase = await createClient();
  const { data: tasks } = await supabase.from("Tasks").select();*/
  let task: Tables<'Tasks'> = {
    id: 123453,
    created_at: new Date().toDateString(),
    due_date: new Date().toDateString(),
    title: "test",
    description: "test test",
    priority: "high",
    completed: true,
    task_list: "test",
    user: "test"
  };
  return [task];
}

export default async function page({
  params,
}: {
  params: {
    userId:string;
   
  };
}) {
  const tasks = await getTasks()

  return (<Tasks tasks={tasks}/>);
}