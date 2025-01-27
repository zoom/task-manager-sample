import {createClient} from "@/utils/supabase/server";
import Tasks from "@/components/taskmanger/tasks";

import type { Tables } from '@/lib/types'
type Task = Tables<'tasks'>

async function getTasks(): Promise<Task[]> {
const supabase = await createClient();
  const { data: tasks } = await supabase.from("tasks").select().returns<Task[]>();

  console.log("tasks", tasks);

  return tasks;
}

export default async function page({
  params,
}: {
  params: {
    userId:string;
   
  };
}) {
  //const tasks = await getTasks()
  const tasks = await getTasks()



  return (<Tasks tasks={tasks}/>);
}