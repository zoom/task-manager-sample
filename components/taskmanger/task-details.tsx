'use client';

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronsUp, ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from '@/lib/types';


// Import Server Action
import { sendTeamChatBotMessage } from "@/app/lib/chatbot";

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
  const router = useRouter();

  // Store selected subtasks as { id, title }
  const [selectedSubtasks, setSelectedSubtasks] = useState<{ id: number; title: string }[]>([]);


  // Handle form submission state
  const [state, formAction] = useActionState(sendTeamChatBotMessage, { success: false });

  const [location, setLocation] = useState("");

  // Redirect after successful form submission
  useEffect(() => {
    setLocation(window.location.href);
    if (state.success) {
      router.back()
    }
  }, [state.success, router]);

  return (
    <div className="max-w-screen-xl min-w-[850px] min-h-[650px] flex flex-col bg-white dark:bg-background md:flex-row gap-5 2xl:gap-10 shadow-lg p-10 overflow-y-auto">
      {/* LEFT */}
      <div className="w-full md:w-1/2 space-y-4">
        <p className="text-gray-500 dark:text-gray-300 font-semibold text-sm">Title:</p>
        <h3 className="text-gray-900 font-semibold dark:text-gray-100">{task.title}</h3>

        <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2" />

        {/* Task Details Section */}
        <div className="space-y-4 py-2">
          <p className="text-gray-500 dark:text-gray-300 font-semibold text-sm">Task-Details</p>
          <p className="text-gray-700 dark:text-gray-300">{task.description}</p>
        </div>

        {/* Subtasks Section */}
        <p className="text-gray-500 dark:text-gray-300 font-semibold text-sm">SubTasks:</p>
        <div className="space-y-2">
          {task.sub_tasks && task.sub_tasks.length > 0 ? (
            task.sub_tasks.map((subtask: { id: number; title: string }) => (
              <div key={subtask.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="subtasks"
                  value={subtask.id}
                  checked={selectedSubtasks.some((s) => s.id === subtask.id)}
                  onChange={() => {
                    setSelectedSubtasks((prev) =>
                      prev.some((s) => s.id === subtask.id)
                        ? prev.filter((s) => s.id !== subtask.id)
                        : [...prev, { id: subtask.id, title: subtask.title }]
                    );
                  }}
                  className="w-4 h-4"
                />
                <span className="text-gray-700 dark:text-gray-300">{subtask.title}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-300">No subtasks available</p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full md:w-1/2 space-y-8">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Activity</p>

        {/* FORM SUBMISSION */}
        <form className="space-y-6" action={formAction}>

          
          <input type="hidden" name="location" value={location} />

          {/* Hidden inputs to submit subtask titles instead of IDs */}
          {selectedSubtasks.map((subtask) => (
            <input key={subtask.id} type="hidden" name="subtasks" value={subtask.title} />
          ))}

          <div className="w-full grid grid-cols-2 gap-4">
            {act_types.map((item) => (
              <div key={item} className="flex gap-2 items-center">
                <input type="radio" name="activity" value={item} required className="w-4 h-4" />
                <p className="text-gray-900 dark:text-gray-100">{item}</p>
              </div>
            ))}
          </div>

          {/* Text Editor */}
          <textarea
            name="message"
            rows={4}
            required
            placeholder="Type ......"
            className="bg-white dark:bg-background w-full border border-gray-300 dark:border-gray-600 outline-none p-4 rounded-md focus:ring-2 ring-blue-500 text-gray-900 dark:text-gray-100"
          ></textarea>

          {/* Display error messages */}
          {state.error && <p className="text-red-500">{state.error}</p>}

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/dashboard");
                }
              }}
              className="bg-gray-400 text-white rounded py-2 px-6"
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white rounded py-2 px-6">
              {state.success ? "Sent!" : "Submit"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default TaskDetails;
