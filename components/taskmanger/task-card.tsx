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
import { OverlappingAvatars } from "./overlapping-avatars";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Remove unused imports
import { getZoomUsersByIds } from "@/src/services/supabase/zoom-users";

import type { Tables } from "@/lib/types";

type Task = Tables<'tasks'>;

// Type issue
type Priority = 'high' | 'medium' | 'low';

const ICONS = {
  high: <ChevronsUp />,
  medium: <ChevronUp />,
  low: <ChevronDown />,
};

export default function TaskCard({
  task,
  onEditClick,
  onDeleteClick,
}: {
  task: Tables<'tasks'> | null;
  onEditClick: (task: Task) => void;
  onDeleteClick: (task: Task) => void;
}) {

  if (!task || !task.title) return null;
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
<Card className="w-full shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-white">
<CardHeader className="p-4">
        <div className="flex justify-between">
          <div className={clsx("flex flex-1 items-center gap-1 text-sm font-medium", PRIORITYSTYLES[priority], "dark:text-white")}>
            <span className="text-lg">{ICONS[priority]}</span>
            <span className="uppercase">{priority} Priority</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage as keyof typeof TASK_TYPE || "completed"])} />
       
          <div>
          <h4 className="line-clamp-1 text-black dark:text-white">{task.title}</h4>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-white">
              {task.due_date ? formatDate(new Date(task.due_date)) : "No due date"}
            </span>
           </div>
        </div>
        
        </div>

        <div className="w-full border-t border-gray-300 my-2" />

        <div className="flex items-center justify-between mb-2">
          

          <div className="flex flex-row-reverse gap-1">
            <Button
              variant="ghost"
              className="p-2 hover:text-white hover:bg-gray-700 transition-colors duration-300 rounded-md"
              onClick={() => onDeleteClick(task)}
            >
              <Trash2 />
            </Button>
            <Button
              variant="ghost"
              className="p-2 hover:text-white hover:bg-gray-700 transition-colors duration-300 rounded-md"
              onClick={() => onEditClick(task)}
            >
              <Pencil />
            </Button>
          </div> 
          <div className="flex">
            <OverlappingAvatars assignedUsers={task.assigned_users || []} />  
            </div>
        </div>
      </CardContent>

      <div className="px-4">
        <div className="w-full border-t border-gray-300 my-2" />
      </div>

      <CardFooter className="p-4">
        <Button
          onClick={() => handleTaskClick(task.id, task.project_id)}
          className="w-full flex items-center gap-4 text-sm font-semibold text-gray-600 dark:text-white bg-white dark:bg-background hover:text-white hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors duration-300 rounded-md p-2"
        >
          <Plus className="text-lg" />
          <span>ADD ACTIVITY</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
