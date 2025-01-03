'use client';

import { useState } from "react";
import { ChevronsUp, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import Loading from '@/components/taskmanger/Loading';
import { PRIORITYSTYLES, TASK_TYPE } from "@/utils/utils";
import clsx from "clsx";

const ICONS = {
  high: <ChevronsUp />,
  medium: <ChevronUp />,
  low: <ChevronDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

type Task = {
  stage: keyof typeof TASK_TYPE;
  title: string;
  image: string;
  time: number;
  description: string;
  completed: boolean;
  id: string;
  priority: 'high' | 'medium' | 'low';
  activities?: { date: string; tag: string; title: string }[];
  assets?: { url: string }[];
  subTasks?: { date: string; tag: string; title: string }[];
  date: string;
};

type TaskDetailsProps = {
  task: Task;
};

const TaskDetails = ({ task }: TaskDetailsProps) => {
  const [selected, setSelected] = useState<string>(act_types[0]);
  const [text, setText] = useState<string>("");
  const isLoading = false;

  const handleSubmit = async () => {
    // Handle form submission logic
    console.log("Submitted:", { selected, text });
  };

  return (
    <div className='w-[750px] flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto'>
      {/* LEFT */}
      <div className='w-full md:w-1/2 space-y-8'>
        <div className='flex items-center gap-5'>
          <div
            className={clsx(
              "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
              PRIORITYSTYLES[task.priority],
              bgColor[task.priority]
            )}
          >
            <span className='text-lg'>{ICONS[task.priority]}</span>
            <span className='uppercase'>{task.priority} Priority</span>
          </div>

          <div className={clsx("flex items-center gap-2")}>
            <div
              className={clsx(
                "w-4 h-4 rounded-full",
                TASK_TYPE[task.stage]
              )}
            />
            <span className='text-black uppercase'>{task.stage}</span>
          </div>
        </div>

        <p className='text-gray-500'>Created At: {new Date(task.date).toDateString()}</p>
        <div className="w-full border-t border-gray-200 my-2" />

        {/* Task-Details */}
        <div className='space-y-4 py-6'>
          <p className='text-gray-500 font-semibold text-sm'>Task-Details</p>
          <div className='space-y-8'>
            {task.subTasks?.map((subTask, index) => (
              <div key={index} className='flex gap-3'>
                <div className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-200'>
                  <Paperclip className='text-violet-600' size={26} />
                </div>
                <div className='space-y-1'>
                  <div className='flex gap-2 items-center'>
                    <span className='text-sm text-gray-500'>
                      {new Date(subTask.date).toDateString()}
                    </span>
                    <span className='px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold'>
                      {subTask.tag}
                    </span>
                  </div>
                  <p className='text-gray-700'>{subTask.title}</p>
                </div>
              </div>
            ))}

            <h1>Title: {task.title}</h1>
            <div className="w-full border-t border-gray-200 my-2" />
            <p>Description: {task.description}</p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className='w-full md:w-1/2 space-y-8'>
        <p className='text-lg font-semibold'>Add Activity</p>
        <div className='w-full grid grid-cols-2 gap-4'>
          {act_types.map((item) => (
            <div key={item} className='flex gap-2 items-center'>
              <input
                type='checkbox'
                className='w-4 h-4'
                checked={selected === item}
                onChange={() => setSelected(item)}
              />
              <p>{item}</p>
            </div>
          ))}
        </div>

        {/* Text Editor */}
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Type ......'
          className='bg-white w-full border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500'
        ></textarea>

        {/* Submit Button */}
        <div className="flex justify-end">
          {isLoading ? (
            <Loading />
          ) : (
            <button
              type='button'
              onClick={handleSubmit}
              className='bg-blue-600 text-white rounded py-2 px-6'
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
