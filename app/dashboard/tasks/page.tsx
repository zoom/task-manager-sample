import Tasks from '@/components/taskmanger/Tasks'


interface Task {
  title: string;
  image: string;
  time: number;
  description: string;
  completed: boolean;
  id: string;
  priority: "high" | "medium" | "low";
  activities?: any[];
  assets?: any[];
  subTasks?: any[];
  date: string;
  stage: string;
}


async function getTasks(): Promise<Task[]> {
  const result = await fetch('http://localhost:4000/tasks')

  return result.json()
}



export default async function page({
  params,
}: {
  params: {
    userId:string;
   
  };
}) {
  console.log("Params: ", params); 

  const tasks = await getTasks()

  return (<Tasks tasks={tasks}/>);
}