import {createClient} from "@/utils/supabase/server";
import {InfoIcon} from "lucide-react";
import {redirect} from "next/navigation";
import TaskListsContainer from "@/components/task-lists/task-lists-container";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/");
    }

    return (
        <div className="flex-1 w-full flex flex-col gap-12">
            <div className="w-full">
                <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
                    <InfoIcon size="16" strokeWidth={2}/>
                    This is a protected page that you can only see as an authenticated
                    user
                </div>
            </div>

            <div className="flex flex-col gap-2 items-start">
                <TaskListsContainer/>
            </div>

            <div className="flex flex-col gap-2 items-start">
                <h2 className="font-bold text-2xl mb-4">Your user details</h2>
                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <pre className="text-xs font-mono p-3rounded overflow-auto">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
        ;
}
