import {createClient} from "@/utils/supabase/server";
import Tasks from "@/components/taskmanger/Tasks";
import {Tables} from "@/lib/types"

async function getTasks(): Promise<Tables<'Tasks'>[]> {
const supabase = await createClient();
  const { data: tasks } = await supabase.from("Tasks").select().returns<Tables<'Tasks'>[]>();

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