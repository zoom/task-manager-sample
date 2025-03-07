import { useRouter, usePathname } from "next/navigation";
import TaskCard from "./task-card";
import type { Tables } from "@/lib/types";
import { deleteTask } from "@/src/services/taskService";

type Priority = 'high' | 'medium' | 'low';
type Task = {
  completed: boolean;
  created_at: string;
  description: string | null;
  due_date: string | null;
  id: number;
  priority: Priority;
  project_id: number;
  stage: string;
  title: string;
  user_id: string;
  sub_tasks: [];
  activities?: any[];
};

export default function BoardView({
  tasks,
  onEditClick,
}: {
  tasks: Task[];
  onEditClick: (task: Task) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Delete handler
  const handleDeleteClick = async (task: Task) => {
    try {
      const error = await deleteTask(task.id);
      if (error) {
        console.error("Error deleting task:", error);
      } else {
        // Optionally show a notification here
        router.refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <>
      <h1>You are on this route: {pathname}</h1>
      <div className="w-full px-0 md:px-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-cols-3">
          {tasks?.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEditClick={onEditClick}
              onDeleteClick={handleDeleteClick}
            />
          ))}
        </div>
      </div>
    </>
  );
}
