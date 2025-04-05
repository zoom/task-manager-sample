"use client";

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
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { AssigneeSelector } from "@/components/taskmanger/assignee-selector";
import { sendZoomIMMessage, ZoomIMMessagePayload } from "@/app/lib/teamchat";
import { getDeeplink } from "@/app/lib/zoom-api";
import TaskNotification from "@/components/taskmanger/task-notification"; // adjust import path as needed
import { redirect } from "next/navigation";

import type { Tables } from "@/lib/types";
type Task = Tables<'tasks'>;

const LISTS = ["todo", "in progress", "completed"];
const PRIORITIES = ["high", "medium", "low"];

type ZoomUser = {
  id: string;
  first_name: string;
  last_name: string;
};

const AddActivity = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  // Notification state for showing the TaskNotification component.
  const [notification, setNotification] = useState<{
    issueId: string;
    deeplink: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<{
    title: string;
    date: string;
    description: string;
    assigned_users: { value: string; label: string }[];
  }>({
    defaultValues: {
      title: "",
      date: "",
      description: "",
      assigned_users: [],
    },
  });

  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [stage, setStage] = useState(LISTS[0]);
  const [availableUsers, setAvailableUsers] = useState<ZoomUser[]>([]);

  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.projectId);

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
    assigned_users: { value: string; label: string }[];
  }) => {
    try {
      const supabase = createClient();

      // Retrieve the current user and session.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        console.error("Session error:", sessionError);
        redirect("/login");
        return;
      }
      const accessToken = sessionData.session.provider_token ?? "";
      console.log("Access Token:", accessToken);

      // Map form assignee options to full user objects.
      const selectedUsers = availableUsers.filter((u) =>
        data.assigned_users.some((option) => option.value === u.id)
      );
      console.log("Selected Users:", selectedUsers.map((u) => u.id));

      // Build the new task object.
      const newTask: Partial<Task> = {
        title: data.title,
        completed: false,
        project_id: projectId,
        user_id: user?.id,
        due_date: new Date(data.date).toISOString(),
        priority,
        stage,
        description: data.description,
        assigned_users: selectedUsers,
      };

      // Insert the new task and retrieve the inserted record.
      const { data: insertedData, error: insertError } = await supabase
        .from("tasks")
        .insert(newTask)
        .select();
      if (insertError || !insertedData || insertedData.length === 0) {
        console.error("Error adding task:", insertError);
        return;
      }
      const insertedTask = insertedData[0];
      console.log("Task Added:", insertedTask);

      // Build Zoom message payload.
      const message = selectedUsers
        .map((u) => `Special delivery for ${u.first_name} ${u.last_name} 📝!`)
        .join(", ");
      const at_items = selectedUsers.map((u) => ({
        at_contact: 'max.test.zoom@gmail.com', // example static value or dynamic if needed
        at_type: 1,
        start_position: 15,
        end_position: 20,
      }));
      const to_contact = selectedUsers.map((u) => u.id).join(",");

      const payload: ZoomIMMessagePayload = {
        message,
        at_items,
        rich_text: [
          {
            start_position: 0,
            end_position: 5,
            format_type: "Paragraph",
            format_attr: "h1",
          },
        ],
        file_ids: [],
        reply_main_message_id: "",
        to_contact,
        interactive_cards: [
          {
            card_json: JSON.stringify({
              content: {
                settings: { form: true },
                head: {
                  text: "New Task Assigned",
                  sub_head: { text: "I am a sub head text" },
                },
                body: [
                  {
                    type: "attachments",
                    resource_url: "https://zoom.us",
                    img_url:
                      "https://d24cgw3uvb9a9h.cloudfront.net/static/93516/image/new/ZoomLogo.png",
                    information: {
                      title: { text: "I am an attachment title" },
                      description: { text: "I am an attachment description" },
                    },
                  },
                  {
                    type: "actions",
                    items: [
                      { text: "Open", value: "open", style: "Primary" },
                      { text: "Edit", value: "edit", style: "Default" },
                    ],
                  },
                ],
              },
            }),
          },
        ],
      };

      // Send the Zoom IM message.
      await sendZoomIMMessage(accessToken, payload);

      // Retrieve a deeplink for the created task.
      const deeplink = await getDeeplink(accessToken);
      console.log("Deeplink-AddTask:", deeplink);
      // Set notification state with the inserted task's id and the deeplink.
      if (insertedTask.id) {
        setNotification({ issueId: insertedTask.id.toString(), deeplink: deeplink || "" });
      } else {
        console.error("Inserted task ID is undefined.");
      }

      // Reset the form and close the dialog. (We intentionally do not refresh immediately
      // so the notification remains visible until dismissed.)
      reset();
      setOpen(false);
    } catch (err) {
      console.error("Error in submitHandler:", err);
    }
  };

  return (
    <>
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
      </div>
      {notification && (
        <TaskNotification
          issueId={notification.issueId}
          deeplink={notification.deeplink}
          onDismiss={() => {
            setNotification(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
};

export default AddActivity;
