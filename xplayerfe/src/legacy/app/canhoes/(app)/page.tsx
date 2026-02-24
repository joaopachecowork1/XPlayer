"use client";

import { CanhoesHubModule } from "@/components/modules/canhoes/CanhoesHubModule";
import { CanhoesShell } from "@/components/canhoes/CanhoesShell";

export default function CanhoesPage() {
  return (
    <CanhoesShell>
        <CanhoesHubModule />
      </CanhoesShell>
  );
}
