import React from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ChevronsUp, ChevronDown, ChevronUp, MessageSquareQuote, Trash2, Plus, Pencil } from 'lucide-react';
import { PRIORITYSTYLES, TASK_TYPE, formatDate } from "@/utils/utils";

import type { Tables } from '@/lib/types';

type Task = Tables<'tasks'>;

const ICONS = {
  high: <ChevronsUp />,
  medium: <ChevronUp />,
  low: <ChevronDown />,
};

type Priority = 'high' | 'medium' | 'low';

export default function TaskCard({
  task,
  onEditClick,
}: {
  task: Tables<'tasks'> & { priority: Priority, activities?: any[] };
  onEditClick: any;
}) {
    
    // Initialize the router
  const router = useRouter();

  // Cast the priority to ensure it's of type Priority
  const priority = task.priority as Priority;

  const handleTaskClick = (taskId: number, projectId: number) => {
    if (!projectId) {
      console.error("Error: Project ID is undefined for task", taskId);
      return;
    }
    router.push(`/dashboard/projects/${projectId}/tasks/${taskId}`);
  };

  return (
    <div className="w-full bg-white dark:bg-background text-black dark:text-white shadow-md p-4 rounded-lg space-y-4 border dark:border-border">
      {/* Task Priority */}
      <div className="w-full flex justify-between">
        <div
          className={clsx(
            "flex flex-1 gap-1 items-center text-sm font-medium",
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
        <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage as keyof typeof TASK_TYPE || "todo"])} />
        <h4 className="line-clamp-1 text-black dark:text-white">{task.title}</h4>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 my-2" />

      {/* Task Details */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-white">
            {task.due_date ? formatDate(new Date(task.due_date)) : 'No due date'}
          </span>

          <div className="flex gap-1 items-center text-sm text-gray-600 dark:text-white">
            <MessageSquareQuote />
            <span>{task.activities?.length || 0}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row-reverse gap-1">
          <div className="flex gap-2 items-center text-sm text-gray-600 dark:text-white hover:bg-gray-700 transition-colors duration-300 rounded-md p-2">
            <Trash2 />
          </div>

          <div className="flex gap-2 items-center text-sm text-gray-600 dark:text-white hover:bg-gray-700 transition-colors duration-300 rounded-md p-2">
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
          className="w-full flex gap-4 items-center text-sm text-gray-600 dark:text-white font-semibold hover:bg-gray-700 transition-colors duration-300 rounded-md p-2"
        >
          <Plus className="text-lg" />
          <span>ADD ACTIVITY</span>
        </button>
      </div>
    </div>
  );
}
