import Link from "next/link";
import { Home, Gamepad2 } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 border-r p-4 flex-col gap-2">
      <h1 className="text-xl font-bold mb-4">🎮 XPlayer</h1>

      <Link
        href="/"
        className="flex items-center gap-2 p-2 rounded hover:bg-muted"
      >
        <Home size={18} />
        Dashboard
      </Link>

      <Link
        href="/session"
        className="flex items-center gap-2 p-2 rounded hover:bg-muted"
      >
        <Gamepad2 size={18} />
        Start Session
      </Link>
    </aside>
  );
}
