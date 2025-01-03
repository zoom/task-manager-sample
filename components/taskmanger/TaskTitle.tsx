
import React from "react";
import { Plus } from 'lucide-react';
import { CardTitle } from "@/components/ui/card";
import clsx from "clsx";


const TaskTitle = ({ label, className }: { label: string; className?: string }) => {
  return (
    <div className="w-full h-10 md:h-12 px-2 md:px-4 rounded bg-white flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <div className={clsx("w-4 h-4 rounded-full", className)} />
        <CardTitle className="text-sm md:text-base text-gray-600">{label}</CardTitle>
      </div>
      <button className="hidden md:block">
        <Plus className="text-lg text-black" />
      </button>
    </div>
  );
};

export default TaskTitle;