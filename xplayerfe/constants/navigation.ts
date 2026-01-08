import { Home, Calendar, Users, Settings } from "lucide-react";

export const NAVIGATION_ITEMS = [
  { id: "home", label: "Início", icon: Home, href: "/dashboard" },
  { id: "sessions", label: "Sessões", icon: Calendar, href: "/dashboard/sessions" },
  { id: "friends", label: "Amigos", icon: Users, href: "/dashboard/friends" },
  { id: "settings", label: "Definições", icon: Settings, href: "/dashboard/settings" },
];