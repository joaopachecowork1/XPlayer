"use client";

import { CanhoesVotingModule } from "@/components/modules/canhoes/CanhoesVotingModule";
import { CanhoesShell } from "@/components/canhoes/CanhoesShell";

export default function VotacaoPage() {
  return (
    <CanhoesShell>
        <CanhoesVotingModule />
      </CanhoesShell>
  );
}
