import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";

type AssignedUser = {
  id: string;
  first_name: string;
  last_name: string;
};

type OverlappingAvatarsProps = {
  assignedUsers: AssignedUser[];
};

export function OverlappingAvatars({ assignedUsers }: OverlappingAvatarsProps) {
  const bgColors = [
    "bg-blue-600",
    "bg-green-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-yellow-500",
  ];

  return (
    <div className="flex -space-x-2">
      {assignedUsers.map((user, index) => (
        <Avatar
          key={user.id}
          className="w-10 h-10 rounded-full border dark:border-white"
        >
          <AvatarFallback
            className={clsx(
              "w-full h-full flex items-center justify-center rounded-full font-bold text-white",
              bgColors[index % bgColors.length],
              "dark:bg-gray-800"
            )}
          >
            {user.first_name.charAt(0)}
            {user.last_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
