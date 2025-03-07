'use client';

import { useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Import useParams
import { ChevronsUp, ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import Loading from '@/components/taskmanger/loading';
import { sendTeamChatBotMessage } from "@/src/services/zoomApi";
import { PRIORITYSTYLES, TASK_TYPE } from "@/utils/utils";
import clsx from "clsx";

import type { Tables } from '@/lib/types';
type Task = Tables<'tasks'>;

const ICONS = {
  high: <ChevronsUp />,
  medium: <ChevronUp />,
  low: <ChevronDown />,
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

type TaskDetailsProps = {
  task: Tables<'tasks'>;
};

const TaskDetails = ({ task }: TaskDetailsProps) => {
  const [selected, setSelected] = useState<string>(act_types[0]);
  const [text, setText] = useState<string>("");
  // New state for tracking selected subtask IDs
  const [selectedSubtasks, setSelectedSubtasks] = useState<number[]>([]);
  const isLoading = false;
  const router = useRouter();
  const params = useParams(); 

  const projectId = params.projectId as string; 

  const handleSubmit = async () => {
    // Derive the full details of selected subtasks
    const selectedSubtaskDetails = task.sub_tasks
      ? task.sub_tasks.filter((subtask: any) => selectedSubtasks.includes(subtask.id)): [];
  
    console.log("Task Details Data:", { selected, text, selectedSubtaskDetails });
    
    try {
      const response = await fetch('/api/zoom/teamchatbot', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ selected, text, selectedSubtaskDetails }),
      });
      if (!response.ok) {
        throw new Error("Failed to send chatbot message");
      }
      
      const data = await response.json();
      console.log("Chatbot Response:", data);
    } catch (error) {
      console.error(error);
    }
    router.push(`/dashboard/projects/${projectId}/tasks`);
  };
  const handleCancel = () => {
    router.push(`/dashboard/projects/${projectId}/tasks`);
  };

  return (
    <div className="w-[850px] flex flex-col bg-white dark:bg-background md:flex-row gap-5 2xl:gap-8 shadow-md p-8 overflow-y-auto">
      {/* LEFT */}
      <div className="w-full md:w-1/2 space-y-4">
        <p className="text-gray-500 dark:text-gray-300 font-semibold text-sm">
          Title:
        </p>
        <h3 className="text-gray-900 font-semibold dark:text-gray-100">
          {task.title}
        </h3>

        <div className="mt-2 w-full border-t border-gray-200 dark:border-gray-700" />
        <p className="text-gray-500 dark:text-gray-300 font-semibold text-sm">
          Priority:
        </p>

        <div className="flex items-center gap-5">
          <div
            className={clsx(
              "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full"
              // Optionally add PRIORITYSTYLES and bgColor here if needed
            )}
          >
            <span className="uppercase">{task.priority} Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className={clsx(
                "w-4 h-4 rounded-full"
                // Optionally add TASK_TYPE styling here if needed
              )}
            />
          </div>
        </div>

        <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2" />

        {/* Task Details Section */}
        <div className="space-y-4 py-2">
          <p className="text-gray-500 dark:text-gray-300 font-semibold text-sm">
            Task-Details
          </p>
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {task.description}
            </p>
            <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2" />

            {/* Subtasks Section */}
            <p className="text-gray-500 dark:text-gray-300 font-semibold text-sm">
              SubTasks:
            </p>
            <div className="space-y-2">
              {task.sub_tasks && task.sub_tasks.length > 0 ? (
                task.sub_tasks.map((subtask: any) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      // Use the state variable to determine if the checkbox is checked
                      checked={selectedSubtasks.includes(subtask.id)}
                      onChange={() => {
                        setSelectedSubtasks(prev => {
                          if (prev.includes(subtask.id)) {
                            return prev.filter(id => id !== subtask.id);
                          } else {
                            return [...prev, subtask.id];
                          }
                        });
                      }}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {subtask.title}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-300">
                  No subtasks available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 space-y-8">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Add Activity
        </p>
        <div className="w-full grid grid-cols-2 gap-4">
          {act_types.map((item) => (
            <div key={item} className="flex gap-2 items-center">
              <input
                type="checkbox"
                className="w-4 h-4"
                checked={selected === item}
                onChange={() => setSelected(item)}
              />
              <p className="text-gray-900 dark:text-gray-100">{item}</p>
            </div>
          ))}
        </div>

        {/* Text Editor */}
        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type ......"
          className="bg-white dark:bg-background w-full border border-gray-300 dark:border-gray-600 outline-none p-4 rounded-md focus:ring-2 ring-blue-500 text-gray-900 dark:text-gray-100"
        ></textarea>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white rounded py-2 px-6"
          >
            Cancel
          </button>
          {isLoading ? (
            <Loading />
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 text-white rounded py-2 px-6"
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
