import TaskDetails from '@/components/taskmanger/task-details';

import type { Tables } from '@/lib/types'
type Task = Tables<'tasks'>

async function getTaskDetails(taskId: string): Promise<Task> {
  //const result = await fetch(`http://localhost:4000/tasks/${taskId}`);
  //return result.json();
  let task: Task = {
    id: 1,
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

export default async function Page({ params }: { params: { projectId:string , tasksId: string } }) {
  const { projectId, tasksId } = await params;
  const task = await getTaskDetails(tasksId);

  console.log('Task: ', task);

  return ( <TaskDetails task={task} />); 
}
