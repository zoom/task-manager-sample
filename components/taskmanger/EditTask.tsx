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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

interface Task {
  title: string;
  image: string;
  time: number;
  description: string;
  completed: boolean;
  id: string;
  priority: string;
  stage: string;
  assets?: any[];
  subTasks?: any[];
  date: string;
}

interface EditTaskProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  task: Task; // Pass the task data to the EditTask component
}

const EditTask: React.FC<EditTaskProps> = ({ open, setOpen, task }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();
  const [stage, setStage] = useState<string>(task?.stage);
  const [priority, setPriority] = useState<string>(task?.priority);
  
  useEffect(() => {
    setValue("title", task?.title); // Pre-fill the task title
    setValue("date", task?.date); // Pre-fill the task date
  }, [task, setValue]);

  const submitHandler = (data: any) => {
    // Handle form submission
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the details of the task.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Task Title
              </label>
              <Input
                id="title"
                placeholder="Enter task title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && <p className="text-red-500 text-sm">{String(errors.title.message)}</p>}
            </div>

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
                    {["TODO", "IN PROGRESS", "COMPLETED"].map((list, index) => (
                      <SelectItem key={index} value={list}>
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
                <Input type="date" id="date" {...register("date")} />
                {errors.date && <p className="text-red-500 text-sm">{String(errors.date.message)}</p>}
              </div>
            </div>

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
                    {["HIGH", "MEDIUM", "NORMAL", "LOW"].map((level, index) => (
                      <SelectItem key={index} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
  );
};

export default EditTask;
