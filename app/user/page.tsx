import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";


export default async function UserPage() {
    const supabase = await createClient();

    const {
        data: {user},
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/");
    }

    return (
        <div className="flex flex-col gap-2 items-start">
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
    )
}
