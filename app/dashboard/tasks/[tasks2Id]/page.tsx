import TaskDetails from '@/components/taskmanger/TaskDetails';
import {Tables} from "@/lib/types"



async function getTaskDetails(taskId: string): Promise<Tables<'Tasks'>> {
  //const result = await fetch(`http://localhost:4000/tasks/${taskId}`);
  //return result.json();
  let task: Tables<'Tasks'> = {
    id: 123453,
    created_at: new Date().toDateString(),
    due_date: new Date().toDateString(),
    title: "test",
    description: "test test",
    priority: "high",
    completed: true,
    task_list: "test list",
    user: "test"
  };
  return task;
}

export default async function Page({ params }: { params: { tasks2Id: string } }) {
  const task = await getTaskDetails( params.tasks2Id);

  console.log('Task: ', task);

  return ( <TaskDetails task={task} />); 
}
