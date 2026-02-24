import { Settings } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function SettingsModule() {
  return (
    <div className="space-y-6">
      <EmptyState
        icon={Settings}
        title="Definições"
        description="Configura a tua conta"
      />
    </div>
  );
}