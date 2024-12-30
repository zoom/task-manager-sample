"use client";

import TaskCard from "./TaskCard";
import { usePathname } from "next/navigation";

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
}

export default function BoardView({ tasks , onEditClick }: { tasks: Task[], onEditClick: any }) {
  const pathname = usePathname(); // Get the current pathname

  return (
    <> 
    <h1>You are on this route: { pathname} </h1>
    
    <div className="w-full h-auto w-auto py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-9 2xl:gap-10">
      
      {tasks?.map((task) => (
        <TaskCard task={task} key={task.id} onEditClick={() => onEditClick(task)}/>
      ))}
    </div>
    </>
  );
}
