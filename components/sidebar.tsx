"use client";

import { useState } from "react";
import { Home, Settings, Users, Menu, Newspaper, ChartNoAxesCombined, Send } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/users-contacts", label: "Users", icon: Users },
  { href: "/zoomapp/zcx", label: "App Context", icon: Newspaper },
  { href: "/zoomapp/zoom-card", label: "Message", icon: Send },
  { href: "/zoomapp/report", label: "Report", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen flex flex-col border-r border-muted bg-muted/40 transition-all duration-300",
        collapsed ? "w-16" : "w-48"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && <span className="font-bold text-lg">MyApp</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto flex flex-col gap-2" aria-label="Sidebar Navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
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
