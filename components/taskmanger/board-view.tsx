import TaskCard from "./task-card";
import { usePathname } from "next/navigation";
import type { Tables } from '@/lib/types';

type Priority = 'high' | 'medium' | 'low';
type Task = Tables<'tasks'> & { priority: Priority; activities?: any[] };

export default function BoardView({
  tasks,
  onEditClick,
}: {
  tasks: Task[];
  onEditClick: (task: Task) => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <h1 >
        You are on this route: {pathname}
      </h1>
      
      <div className="w-full px-0 md:px-0">

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEditClick={onEditClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}
