import React from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  ChevronsUp,
  ChevronDown,
  ChevronUp,
  Trash2,
  Plus,
  Pencil,
} from "lucide-react";
import { PRIORITYSTYLES, TASK_TYPE, formatDate } from "@/utils/utils";

import type { Tables } from "@/lib/types";

type Task = Tables<'tasks'>;
type Priority = 'high' | 'medium' | 'low';

const ICONS = {
  high: <ChevronsUp />,
  medium: <ChevronUp />,
  low: <ChevronDown />,
};

export default function TaskCard({
  task,
  onEditClick,
}: {
  task: Tables<'tasks'> & { priority: Priority, activities?: any[] };
  onEditClick: any;
}) {
  const router = useRouter();
  const priority = task.priority as Priority;

  const handleTaskClick = (taskId: number, projectId: number) => {
    if (!projectId) {
      console.error("Error: Project ID is undefined for task", taskId);
      return;
    }
    router.push(`/dashboard/projects/${projectId}/tasks/${taskId}`);
  };

  return (
    <div
      className="
        w-full 
        bg-white dark:bg-background
        text-black dark:text-white
        shadow-md hover:shadow-lg transition-shadow
        p-4 rounded-lg space-y-4
        border dark:border-border
        empty:hidden
        cursor-pointer
      "
    >
      {/* Task Priority */}
      <div className="flex justify-between">
        <div
          className={clsx(
            "flex flex-1 items-center gap-1 text-sm font-medium",
            PRIORITYSTYLES[priority],
            "dark:text-white"
          )}
        >
          <span className="text-lg">{ICONS[priority]}</span>
          <span className="uppercase">{priority} Priority</span>
        </div>
      </div>

      {/* Task Stage and Title */}
      <div className="flex items-center gap-2">
        <div
          className={clsx(
            "w-4 h-4 rounded-full",
            TASK_TYPE[task.stage as keyof typeof TASK_TYPE || "completed"]
          )}
        />
        <h4 className="line-clamp-1 text-black dark:text-white">
          {task.title}
        </h4>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 my-2" />

      {/* Task Details */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-white">
            {task.due_date ? formatDate(new Date(task.due_date)) : "No due date"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row-reverse gap-1">
          <div className="flex items-center gap-2 rounded-md p-2 text-sm text-gray-600 dark:text-white hover:bg-gray-700 transition-colors duration-300">
            <Trash2 />
          </div>
          <div className="flex items-center gap-2 rounded-md p-2 text-sm text-gray-600 dark:text-white hover:bg-gray-700 transition-colors duration-300">
            <Pencil onClick={() => onEditClick(task)} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 my-2" />

      {/* Add Activity Button */}
      <div className="py-4">
        <button
          onClick={() => handleTaskClick(task.id, task.project_id)}
          className="w-full flex items-center gap-4 rounded-md p-2 text-sm font-semibold text-gray-600 dark:text-white hover:bg-gray-700 transition-colors duration-300"
        >
          <Plus className="text-lg" />
          <span>ADD ACTIVITY</span>
        </button>
      </div>
    </div>
  );
}
