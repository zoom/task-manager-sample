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
import { MessageSquareQuote } from 'lucide-react';


import { useState } from "react";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];
const PRIORITIES = ["HIGH", "MEDIUM", "NORMAL", "LOW"];

interface AddActivityProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddActivity: React.FC<AddActivityProps> = ({ open, setOpen }) => {
  const {
   
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [stage, setStage] = useState<string>(LISTS[0]);
  const [priority, setPriority] = useState<string>(PRIORITIES[2]);
  const [assets, setAssets] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const submitHandler = (data: any) => {
    // Handle form submission
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAssets(Array.from(e.target.files));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>{/* Conditionally render title */}Add Task</DialogTitle>
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
               
              />
              {errors.title && <p className="text-red-500 text-sm">{String(errors.title.message)}</p>}
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
                    {LISTS.map((list, index) => (
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
                <Input
                  type="date"
                  id="date"
                 
                />
                {errors.date && <p className="text-red-500 text-sm">{String(errors.date.message)}</p>}
              </div>
            </div>

            {/* Priority and File Upload */}
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
                    {PRIORITIES.map((level, index) => (
                      <SelectItem key={index} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full flex items-center justify-center">
                <label
                  className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer my-4"
                  htmlFor="imgUpload"
                >
                  <input
                    type="file"
                    className="hidden"
                    id="imgUpload"
                    onChange={handleSelectFiles}
                    accept=".jpg, .png, .jpeg"
                    multiple
                  />
                  <MessageSquareQuote  />
                  <span>Add Assets</span>
                </label>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              {uploading ? (
                <span className="text-sm py-2 text-red-500">Uploading assets...</span>
              ) : (
                <Button type="submit" className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700">
                  Submit
                </Button>
              )}
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

export default AddActivity;
