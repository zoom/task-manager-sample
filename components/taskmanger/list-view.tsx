
import { ChevronsUp, ChevronDown, ChevronUp, MessageSquareQuote, Paperclip, LayoutList } from 'lucide-react';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { PRIORITYSTYLES, TASK_TYPE, formatDate } from "@/utils/utils";

import type { Tables } from '@/lib/types'
type Task = Tables<'Tasks'>

const ICONS = {
  high: <ChevronsUp />,
  medium: <ChevronUp />,
  low: <ChevronDown />,
};



export default function ListView({ tasks , onEditClick}: { tasks: Task[], onEditClick: any}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const router = useRouter();

    const handleTaskClick = (taskId: string) => {
      router.push(`/dashboard/tasks/${taskId}`); 
    };

  const TableHeader = () => (
    <thead className='w-full border-b border-gray-300 my-2 '>
      <tr className='w-full text-black text-left space-y-4'>
        <th className='py-2'>Task Title</th>
        <th className='py-2'>Priority</th>
        <th className='py-2 md:gap-6'>Created At</th>
        <th className='py-2'>Assets</th>
        <th className='py-2'>Actions</th>
      </tr>
    </thead>
  );

  const deleteClicks = (id: string) => {
    console.log(`Delete task with id: ${id}`);
    setSelected(id);
    setOpenDialog(true);
  };

  const TableRow = ({ task }: { task: Task }) => (
    <tr className='border-b border-gray-200 text-gray-600 hover:bg-gray-300/10'>
      <td className='py-2'>
  {/*      <div className='flex items-center gap-2'>
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage as keyof typeof TASK_TYPE])} />
          <p onClick={() => handleTaskClick(task.id)} className='w-full line-clamp-2 text-base text-black hover:text-blue-500'>{task.title}</p>
        </div>*/}
      </td>

      <td className='py-2'>
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", PRIORITYSTYLES[task.priority])}>
            {ICONS[task.priority]}
          </span>
          <span className='capitalize line-clamp-1'>{task.priority} Priority</span>
        </div>
      </td>

      <td className='py-2 gap-2'>
{/*
        <span className='text-sm  text-gray-600'>{task.date ? formatDate(new Date(task.date)) : "N/A"}</span>
*/}
      </td>
    
      <td className='py-2 '>
        <div className='flex items-center gap-3'>
        
          <div className='flex py-1 gap-2 items-center text-sm text-gray-600' >
          <MessageSquareQuote />
{/*
            <span>{task.activities?.length || 0}</span>
*/}
          </div>
          
        </div>
      </td>

      <td className='py-2 flex gap-2 md:gap-6 justify-end'>
        <button
          className='text-blue-600 hover:text-blue-500 sm:px-0 text-sm md:text-base'
          type='button'
          onClick={() => onEditClick(task)}
        >
          Edit
        </button>

        <button
          className='text-red-700 hover:text-red-500 sm:px-0 text-sm md:text-base'
          type='button'
          onClick={() => deleteClicks(task.id)} // Ensure this uses the correct ID
        >
          Delete
        </button>
      </td>
    </tr>
  );

  return (
    <>
      <div className='bg-white px-2 md:px-4 pt-4 pb-9 shadow-md rounded'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <TableHeader />
            <tbody>
              {tasks?.map((task, index) => (
                <TableRow key={task.id} task={task} /> 
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </>
  );
}
