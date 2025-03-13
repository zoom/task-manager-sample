"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BoardView from "./board-view";
import AddActivity from "./add-activity";
import EditTask from "./edit-task";

import type { Tables } from '@/lib/types'

type Task = Tables<'tasks'> ;


const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

export default function Tasks({ tasks }: {
  tasks: Task[]
}) {

  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Tables<'tasks'> | null>(null);

  // Function to handle edit task click
  const handleEditClick = (task: Tables<'tasks'>) => {
    setSelectedTask(task);
    setOpenEdit(true);
  };

  const status = "";

  return (
    <div className="flex-1 w-full max-w-full mx-auto flex flex-col gap-6">
      {/* Header Section */}
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="font-bold text-2xl">Tasks</h2>

        {!status && (
          <Button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 bg-blue-600 text-white rounded-md py-2 px-4"
          >
            <Plus className="text-lg" />
            Create Task
          </Button>
        )}
      </div>

      {/* Task Tabs Section */}
      <div className="w-full max-w-full">

        <BoardView tasks={tasks} onEditClick={handleEditClick} />
      </div>

      <AddActivity open={open} setOpen={setOpen} />

      {/* Pass selected task to EditTask */}
      {selectedTask && (
        <EditTask
          open={openEdit}
          setOpen={setOpenEdit}
          task={selectedTask}
          key={selectedTask.id}
        />
      )}
    </div>
  );
}
