"use client";

import { useState, useEffect } from "react";
import { Home, Settings, Users, Menu, Newspaper, ChartNoAxesCombined, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {createClient} from "@/utils/supabase/client";
import {redirect} from "next/navigation";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/users-contacts", label: "Users", icon: Users },
  { href: "/zoomapp/zoom-context", label: "App Context", icon: Newspaper },
  { href: "/zoomapp/zoom-card", label: "Message", icon: Send },
  { href: "/zoomapp/report", label: "Report", icon: ChartNoAxesCombined },
  { href: "/zoomapp/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const supabase = createClient();

  const [user, setUser] = useState(null as null | { id: string });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Listen for all auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // whenever they sign in or out, session.user will be either a User or null
      setUser(session?.user ?? null);
      setLoading(false);
    });
  
    // 2) Fetch initial session (won't throw if there's no session)
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.error("Error getting initial session:", err);
        setUser(null);
        return redirect("/");
      })
      .finally(() => {
        setLoading(false);
      });
  
    // 3) Clean up listener
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
  
  if (loading) {
    // you could render a spinner here instead
    return null;
  }

  if (!user) {
    // not logged in
    return null;
  }

  return (
    <div
    className={cn(
      "fixed inset-y-0 left-0 flex flex-col border-r border-muted bg-muted/40 transition-all duration-300",

      // ALWAYS visible (remove your old `hidden sm:flex`)
      // 1) hide on xs:
        "hidden sm:flex",

      // manual toggle: 4rem vs 10rem
      collapsed ? "w-16" : "w-40",

      // AUTOMATIC collapse at ≤ 320px panel width:
      "max-[320px]:w-16",

      // still allow manual expand on medium+ if you want
      "md:" + (collapsed ? "w-16" : "w-40")
    )}
  >
      <div className="flex items-center justify-between p-4">
      {!collapsed && <span className="max-[320px]:hidden font-bold text-lg">MyApp</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto flex  flex-col gap-2" aria-label="Sidebar Navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors",
              // center icons when collapsed or at ≤320px
              collapsed || "max-[320px]:justify-center",
              collapsed && "justify-center"
            )}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
}
