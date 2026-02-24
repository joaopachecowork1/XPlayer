import { Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function FriendsModule() {
  return (
    <div className="space-y-6">
      <EmptyState
        icon={Users}
        title="Amigos"
        description="Gere a tua lista de amigos"
      />
    </div>
  );
}