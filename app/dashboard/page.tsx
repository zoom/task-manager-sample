import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";
import TaskListsContainer from "@/components/task-lists/task-lists-container";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/");
    }

    return (
        <div className="flex flex-row w-full max-w-full">
            <TaskListsContainer/>
        </div>
    );
}
