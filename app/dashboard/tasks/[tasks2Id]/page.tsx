import TaskDetails from '@/components/taskmanger/TaskDeatils';

interface Task {
  title: string;
  image: string;
  time: number;
  description: string;
  completed: boolean;
  id: string;
  priority: 'high' | 'medium' | 'low';
  activities?: any[];
  assets?: any[];
  subTasks?: any[];
  date: string;
  stage:string;
}

async function getTaskDetails(taskId: string): Promise<Task> {
  const result = await fetch(`http://localhost:4000/tasks/${taskId}`);
  return result.json();
}

export default async function Page({ params }: { params: { tasks2Id: string } }) {
  console.log('Params: ', params.tasks2Id); 

  const task = await getTaskDetails( params.tasks2Id);

  console.log('Task: ', task);

  return ( <TaskDetails task={task} />); 
}
