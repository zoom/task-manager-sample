"use client";

import { AlignJustify, Grid2X2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TaskTabs from "./Tabs";
import BoardView from "./BoardView";
import ListView from "./ListView";
import AddActivity from "./AddActivity";
import EditTask from "./EditTask";
import TaskTitle from "./TaskTitle";

interface Task {
  title: string;
  image: string;
  time: number;
  description: string;
  completed: boolean;
  id: string;
  priority: "high" | "medium" | "low";
  activities?: any[];
  assets?: any[];
  subTasks?: any[];
  date: string;
  stage: string;
}

const TABS = [
  { title: "Board View", icon: <Grid2X2 /> },
  { title: "List View", icon: <AlignJustify /> },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

export default function Tasks({ tasks }: { tasks: Task[] }) {
  const [selected, setSelected] = useState(TABS[0].title); 
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); 

  // Function to handle edit task click
  const handleEditClick = (task: Task) => {
    setSelectedTask(task); 
    setOpenEdit(true); 
  };

  const status = "";

  return (
    <div className="flex-1 w-[750px] mx-auto flex flex-col gap-6">
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
      <div className="w-full">
        <TaskTabs tabs={TABS} selected={selected} setSelected={setSelected}>
          {!status && (
            <div className='w-full flex justify-between gap-4 md:gap-x-12 py-4'>
              <TaskTitle label='To Do' className={TASK_TYPE.todo} />
              <TaskTitle label='In Progress' className={TASK_TYPE["in progress"]} />
              <TaskTitle label='Completed' className={TASK_TYPE.completed} />
            </div>
          )}
          {/* Render content dynamically based on selected tab */}
          {selected === "Board View" ? (
            <BoardView tasks={tasks} onEditClick={handleEditClick} />
          ) : (
            <ListView tasks={tasks} onEditClick={handleEditClick} /> 
          )}
        </TaskTabs>
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
