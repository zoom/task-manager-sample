import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type AssignedUser = {
  id: string;
  first_name: string;
  last_name: string;
};

type OverlappingAvatarsProps = {
  assignedUsers: AssignedUser[];
};

export function OverlappingAvatars({ assignedUsers }: OverlappingAvatarsProps) {
  console.log("Assigned Users:", assignedUsers);

  return (
    <div className="flex -space-x-2">
      {assignedUsers.map(user => (
        <Avatar key={user.id} className="w-10 h-10 border border-white">
          <AvatarFallback>
            {user.first_name.charAt(0)}
            {user.last_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
