import { useRouter} from "next/navigation";
import TaskCard from "./task-card";
import type { Tables } from "@/lib/types";
import { deleteTask } from "@/utils/supabase/task-service";

type Task = Tables<'tasks'>;

export default function BoardView({
  tasks,
  onEditClick,
}: {
  tasks: Task[];
  onEditClick: (task: Task) => void;
}) {
  
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
