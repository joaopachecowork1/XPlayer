"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Calendar, Users, Settings, Plus, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAVIGATION_ITEMS = [
  { id: "home", label: "Início", icon: Home, href: "/" },
  { id: "sessions", label: "Sessões", icon: Calendar, href: "/sessions" },
  { id: "friends", label: "Amigos", icon: Users, href: "/friends" },
  { id: "settings", label: "Definições", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
              <span className="text-xl font-bold">XPlayer</span>
            </Link>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={collapsed ? "mx-auto" : ""}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* New Session Button */}
        <div className="p-4 border-t">
          <Link href="/sessions">
            <Button className="w-full gap-2">
              <Plus className="h-5 w-5" />
              {!collapsed && <span>Nova Sessão</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}