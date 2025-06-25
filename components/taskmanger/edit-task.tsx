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
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";

import type { Tables } from "@/lib/types";
import { AssigneeSelector } from "@/components/taskmanger/assignee-selector";

import { sendZoomIMMessage, ZoomIMMessagePayload  } from "@/app/lib/teamchat";
import { redirect } from "next/navigation";

type Task = Tables<'tasks'>;

const LISTS = ["todo", "in progress", "completed"];
const PRIORITIES = ["high", "medium", "normal", "low"];

type ZoomUser = {
  id: string;
  first_name: string;
  last_name: string;
};

const EditTask = ({
  open,
  setOpen,
  task,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  task: Task;
}) => {

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<{
    title: string;
    date: string;
    description: string;
    additionalTask: string;
    assigned_users: { value: string; label: string }[];
  }>({
    defaultValues: {
      title: "",
      date: "",
      description: "",
      additionalTask: "",
      assigned_users: [],
    },
  });


  const [priority, setPriority] = useState<string>(task?.priority.toLowerCase());
  const [stage, setStage] = useState<string>(task?.stage.toLowerCase());
  const [availableUsers, setAvailableUsers] = useState<ZoomUser[]>([]);

  const router = useRouter();
  const params = useParams();
  const projectId = Number(params?.projectId);

  // Pre-populate the form values based on the task data.
  useEffect(() => {
    setValue("title", task?.title);
    setValue("description", task?.description || "");
    setValue("date", task?.due_date ? task.due_date.substring(0, 10) : "");
    setValue("additionalTask", "");
    if (task.assigned_users && Array.isArray(task.assigned_users)) {
      // Map existing assigned users to the { value, label } format.
      const assignedOptions = task.assigned_users.map((u: any) => ({
        value: u.id,
        label: `${u.first_name} ${u.last_name}`,
      }));
      setValue("assigned_users", assignedOptions);
    }
  }, [task, setValue]);

  // Fetch available users from the zoom_users table on mount.
  useEffect(() => {
    async function fetchAvailableUsers() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("zoom_users")
        .select("id, first_name, last_name");
      if (error) {
        console.error("Error fetching zoom users:", error);
      } else if (data) {
        setAvailableUsers(data);
      }
    }
    fetchAvailableUsers();
  }, []);

  const submitHandler = async (data: {
    title: string;
    date: string;
    description: string;
    additionalTask: string;
    assigned_users: { value: string; label: string }[];
  }) => {
    try {
      // Initialize Supabase client.
      const supabase = createClient();
  
      // Get the current authenticated session and access token.
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        console.error("Session error:", sessionError);
        redirect("/login");
        return;
      }
      const accessToken = sessionData.session.provider_token ?? "";
      console.log("Access Token:", accessToken);
  
      // Map form assignee values to full user objects.
      const selectedUsers = availableUsers.filter((u) =>
        data.assigned_users.some((option) => option.value === u.id)
      );
      console.log("Selected Users:", selectedUsers.map((u) => u.id));
  
      // Determine which users are new (i.e. not already assigned).
      const previousAssignedUserIDs = task.assigned_users?.map((u: any) => u.id) || [];
      const newAssignedUsers = selectedUsers.filter((u) => !previousAssignedUserIDs.includes(u.id));
  
      // Build the updated task object.
      const updatedTask: Partial<Task> = {
        title: data.title,
        due_date: new Date(data.date).toISOString(),
        description: data.description,
        priority,
        stage,
        assigned_users: selectedUsers,
      };
  
      // Update the main task record.
      const { error: updateError } = await supabase
        .from("tasks")
        .update(updatedTask)
        .eq("id", task.id);
  
      if (updateError) {
        console.error("Error updating task:", updateError);
        return;
      }
  
      // Insert an additional subtask if provided.
      if (data.additionalTask) {
        const newSubtask = {
          task_id: task.id,
          title: data.additionalTask,
        };
  
        const { error: subtaskError } = await supabase.from("sub_tasks").insert(newSubtask);
        if (subtaskError) {
          console.error("Error inserting subtask:", subtaskError);
        } else {
          console.log("Subtask added:", newSubtask);
        }
      }
  
      // For each newly added assignee, send a Zoom IM message.
      for (const newUser of newAssignedUsers) {
        const messageText = `You have been assigned to the task: "${data.title}". Please check your task list for details.`;

        const payload: ZoomIMMessagePayload = {
          message: messageText,
          rich_text: [
            {
              start_position: messageText.indexOf("Please check your task list for details."),
              end_position: messageText.length, // assuming the rest of the message should be bold
              format_type: "Bold",
              format_attr: "",
            },
          ],
          to_contact: newUser.id, 
          // Optionally, add extra properties such as interactive cards:
          interactive_cards: [
            {
              card_json: JSON.stringify({
                content: {
                  settings: { form: true },
                  head: {
                    text: "New Task Assignment",
                    sub_head: { text: "Please review the task details" },
                  },
                  body: [
                    {
                      type: "attachments",
                      resource_url: "https://yourapp.com/task-details",
                      img_url:
                        "https://d24cgw3uvb9a9h.cloudfront.net/static/93516/image/new/ZoomLogo.png",
                      information: {
                        title: { text: data.title },
                        description: { text: data.description },
                      },
                    },
                    {
                      type: "actions",
                      items: [
                        {
                          text: "Comment",
                          value: "button2",
                          style: "Default",
                          action: "dialog", 
                          dialog: {
                            size: "M",
                            link: "https://donte.ngrok.io/zoomapp/zoom-card",
                            title: { text: "Zoom Dashboard" },
                          },
                        },
                        { text: "View Task", value: "view", style: "Primary" },
                        { text: "Dismiss", value: "dismiss", style: "Default" },
                      ],
                    },
                  ],
                },
              }),
            },
          ],
        };
  
        try {
          await sendZoomIMMessage(accessToken, payload);
          console.log(`Notification sent to ${newUser.first_name} ${newUser.last_name}`);
        } catch (err) {
          console.error(`Failed to notify ${newUser.first_name} ${newUser.last_name}:`, err);
        }
      }
  
      // Close the dialog and refresh the page.
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Error in submitHandler:", err);
    }
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
              {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
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
              {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
            </div>

            {/* Additional Task (for subtask insertion) */}
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

            {/* Assignee Selection */}
            <div>
              <label htmlFor="assigned_users" className="block text-sm font-medium text-gray-700">
                Assign Task (Select one or more)
              </label>
              <Controller
                control={control}
                name="assigned_users"
                rules={{ required: "Please assign at least one user" }}
                render={({ field: { onChange, value } }) => (
                  <AssigneeSelector
                    options={availableUsers.map((u) => ({
                      value: u.id,
                      label: `${u.first_name} ${u.last_name}`,
                    }))}
                    value={value || []}
                    onChange={onChange}
                  />
                )}
              />
              {errors.assigned_users && (
                <p className="text-red-500 text-sm">{errors.assigned_users.message}</p>
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
                        {list.toUpperCase()}
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
                {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
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
                        {level.toUpperCase()}
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
  );
};

export default EditTask;
