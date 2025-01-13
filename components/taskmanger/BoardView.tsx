
import TaskCard from "./TaskCard";
import { usePathname } from "next/navigation";
import {Tables} from "@/lib/types"


export default function BoardView({ tasks , onEditClick }: { tasks: Tables<'Tasks'>[], onEditClick: any }) {
  const pathname = usePathname(); 

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
