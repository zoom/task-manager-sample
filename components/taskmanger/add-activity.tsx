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
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";

import type { Tables } from "@/lib/types";
type Task = Tables<'tasks'>;

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];

const AddActivity = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ title: string; date: string; description: string }>();

  
  const [priority, setPriority] = useState(PRIORITIES[1]); 
  const [stage, setStage] = useState(LISTS[0]); 

  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.projectId); 

  const submitHandler = async (data: { title: string; date: string; description: string }) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build task object using actual values from the form and state
    const task: Partial<Task> = {
      title: data.title,
      completed: false,
      project_id: projectId,
      user_id: user?.id,
      due_date: new Date(data.date).toISOString(), // Convert date to ISO string
      priority, // from state (e.g., "MEDIUM")
      stage, // from state (e.g., "TODO")
      description: data.description, // now using the description field from form
    };

    const { error } = await supabase.from("tasks").insert(task);
    
    if (error) {
      console.error("Error adding task:", error);
    } else {
      console.log("Task Added", task);
    }

    // Close the dialog and refresh the route so the new task card shows.
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="w-full bg-white dark:bg-background text-black dark:text-white shadow-md p-4 rounded-lg space-y-4 border border-gray-300 dark:border-border">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit(submitHandler)}>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new task.
              </DialogDescription>
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
                  {...register("title", { required: "Task title is required" })}
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
                  {...register("description", { required: "Task description is required" })}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-gray-100"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
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
                    {...register("date", { required: "Task date is required" })}
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
                <Button type="submit" className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700">
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
    </div>
  );
};

export default AddActivity;
