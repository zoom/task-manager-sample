'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";

import type { Tables } from "@/lib/types";
type Task = Tables<'tasks'>;

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORITIES = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

const EditTask = ({
  open,
  setOpen,
  task,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  task: Task;
}) => {
  // Extend form to include description along with title, date, and additionalTask.
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{ title: string; date: string; description: string; additionalTask: string }>();

  // Track priority and stage in state
  const [priority, setPriority] = useState<string>(task?.priority);
  const [stage, setStage] = useState<string>(task?.stage);

  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.projectId); // Assuming projectId is in the URL

  useEffect(() => {
    setValue("title", task?.title);
    setValue("description", task?.description || "");
    // If due_date is ISO string, we extract the date portion (YYYY-MM-DD)
    setValue("date", task?.due_date ? task.due_date.substring(0, 10) : "");
    setValue("additionalTask", "");
  }, [task, setValue]);

  const submitHandler = async (data: { title: string; date: string; description: string; additionalTask: string }) => {
    const supabase = createClient();

    // Update the main task record.
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        title: data.title,
        due_date: new Date(data.date).toISOString(),
        description: data.description,
        priority: priority,
        stage: stage,
      })
      .eq("id", task.id);

    if (updateError) {
      console.error("Error updating task:", updateError);
    } else {
      console.log("Task updated", { ...data, priority, stage });
    }

    // If additionalTask has been provided, insert it as a new subtask.
    if (data.additionalTask) {
      const subtask = {
        task_id: task.id,
        title: data.additionalTask,
        // Optionally add more fields (like date or tag) if needed.
      };

      const { error: subtaskError } = await supabase.from("sub_tasks").insert(subtask);
      if (subtaskError) {
        console.error("Error inserting subtask:", subtaskError);
      } else {
        console.log("Subtask added", subtask);
      }
    }

    // Close the dialog and refresh the page to show the updated data.
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the details of the task.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Task Title
              </label>
              <Input
                id="title"
                placeholder="Enter task title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Task Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Task Description
              </label>
              <textarea
                id="description"
                placeholder="Enter task description"
                {...register("description", { required: "Description is required" })}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-gray-100"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>

            {/* Additional Task (for Subtask insertion) */}
            <div>
              <label htmlFor="additionalTask" className="block text-sm font-medium text-gray-700">
                Additional Task
              </label>
              <Input
                id="additionalTask"
                placeholder="Enter additional task"
                {...register("additionalTask")}
              />
              {errors.additionalTask && (
                <p className="text-red-500 text-sm">{errors.additionalTask.message}</p>
              )}
            </div>

            {/* Task Stage and Date */}
            <div className="flex gap-4">
              <div className="w-full">
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                  Task Stage
                </label>
                <Select onValueChange={setStage} defaultValue={stage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTS.map((list) => (
                      <SelectItem key={list} value={list}>
                        {list}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Task Date
                </label>
                <Input
                  type="date"
                  id="date"
                  {...register("date", { required: "Date is required" })}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Priority */}
            <div className="flex gap-4">
              <div className="w-full">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority Level
                </label>
                <Select onValueChange={setPriority} defaultValue={priority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <Button
                type="submit"
                className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Submit
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                className="px-5 text-sm font-semibold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTask;
