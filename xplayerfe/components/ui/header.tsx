import { User } from "lucide-react";

export default function Header() {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-background">
      <span className="font-semibold">XPlayer</span>
      <div className="flex items-center gap-2 text-sm">
        <User className="w-4 h-4" />
        {token ? "Logged in" : "Not logged in"}
      </div>
    </header>
  );
}
