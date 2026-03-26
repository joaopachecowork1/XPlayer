"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Cigarette, Flame, Trophy } from "lucide-react";

import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type {
  AwardCategoryDto,
  CanhoesStateDto,
  NomineeDto,
  PublicUserDto,
  UserVoteDto,
  VoteDto,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function formatPhaseLabel(phase?: CanhoesStateDto["phase"]) {
  switch (phase) {
    case "nominations":
      return "Nomeações";
    case "voting":
      return "Votação";
    case "gala":
      return "Gala";
    case "locked":
      return "Fechado";
    default:
      return "Desconhecida";
  }
}

export function CanhoesVotingModule() {
  const { user } = useAuth();

  const [canhoesState, setCanhoesState] = useState<CanhoesStateDto | null>(null);
  const [categoryList, setCategoryList] = useState<AwardCategoryDto[]>([]);
  const [nomineeList, setNomineeList] = useState<NomineeDto[]>([]);
  const [memberList, setMemberList] = useState<PublicUserDto[]>([]);
  const [myNomineeVotes, setMyNomineeVotes] = useState<VoteDto[]>([]);
  const [myMemberVotes, setMyMemberVotes] = useState<UserVoteDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingVoteKey, setSavingVoteKey] = useState<string | null>(null);

  const loadVotingData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [nextState, nextCategories, nextNominees, nextVotes, nextMembers, nextMemberVotes] = await Promise.all([
        canhoesRepo.getState(),
        canhoesRepo.getCategories(),
        canhoesRepo.getNominees(),
        canhoesRepo.myVotes(),
        canhoesRepo.getMembers(),
        canhoesRepo.myUserVotes(),
      ]);

      setCanhoesState(nextState);
      setCategoryList(nextCategories);
      setNomineeList(nextNominees.filter((nominee) => nominee.status === "approved"));
      setMyNomineeVotes(nextVotes);
      setMemberList(nextMembers.filter((member) => member.id !== user?.id));
      setMyMemberVotes(nextMemberVotes);
    } catch (error) {
      console.error(error);
      setCanhoesState(null);
      setCategoryList([]);
      setNomineeList([]);
      setMyNomineeVotes([]);
      setMemberList([]);
      setMyMemberVotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadVotingData();
  }, [loadVotingData]);

  const nomineesByCategory = useMemo(() => {
    const nomineesMap = new Map<string, NomineeDto[]>();

    for (const nominee of nomineeList) {
      if (!nominee.categoryId) continue;

      const nomineesForCategory = nomineesMap.get(nominee.categoryId) ?? [];
      nomineesForCategory.push(nominee);
      nomineesMap.set(nominee.categoryId, nomineesForCategory);
    }

    return nomineesMap;
  }, [nomineeList]);

  const selectedNomineeByCategory = useMemo(() => {
    const selectedVotes = new Map<string, string>();

    for (const vote of myNomineeVotes) {
      selectedVotes.set(vote.categoryId, vote.nomineeId);
    }

    return selectedVotes;
  }, [myNomineeVotes]);

  const selectedMemberByCategory = useMemo(() => {
    const selectedVotes = new Map<string, string>();

    for (const vote of myMemberVotes) {
      selectedVotes.set(vote.categoryId, vote.targetUserId);
    }

    return selectedVotes;
  }, [myMemberVotes]);

  const isVotingPhase = canhoesState?.phase === "voting";

  const handleNomineeVote = async (categoryId: string, nomineeId: string) => {
    if (!isVotingPhase) return;

    setSavingVoteKey(`${categoryId}:${nomineeId}`);
    try {
      await canhoesRepo.castVote({ categoryId, nomineeId });
      setMyNomineeVotes(await canhoesRepo.myVotes());
    } catch (error) {
      console.error(error);
    } finally {
      setSavingVoteKey(null);
    }
  };

  const handleMemberVote = async (categoryId: string, targetUserId: string) => {
    if (!isVotingPhase || targetUserId === user?.id) return;

    setSavingVoteKey(`member:${categoryId}:${targetUserId}`);
    try {
      await canhoesRepo.castUserVote({ categoryId, targetUserId });
      setMyMemberVotes(await canhoesRepo.myUserVotes());
    } finally {
      setSavingVoteKey(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="canhoes-section-title flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[var(--color-fire)]" />
            Votação
          </h1>
          <p className="body-small text-[var(--color-text-muted)]">
            Escolhe um sticker ou um membro por categoria com controlos claros em mobile.
          </p>
        </div>

        {canhoesState ? <Badge variant="outline">Fase: {formatPhaseLabel(canhoesState.phase)}</Badge> : null}
      </div>

      {isLoading ? <p className="body-small text-[var(--color-text-muted)]">A carregar...</p> : null}

      {!isLoading ? (
        <div className="space-y-4">
          {categoryList.map((category) => {
            if (category.kind === "Sticker") {
              const nomineesForCategory = nomineesByCategory.get(category.id) ?? [];
              if (nomineesForCategory.length === 0) return null;

              return (
                <Card key={category.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Cigarette className="h-4 w-4 text-[var(--color-fire)]" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {nomineesForCategory.map((nominee) => (
                      <NomineeVoteOption
                        key={nominee.id}
                        isDisabled={!isVotingPhase || Boolean(savingVoteKey)}
                        isSaving={savingVoteKey === `${category.id}:${nominee.id}`}
                        isSelected={selectedNomineeByCategory.get(category.id) === nominee.id}
                        nominee={nominee}
                        onClick={() => void handleNomineeVote(category.id, nominee.id)}
                      />
                    ))}

                    <p className="body-small text-[var(--color-text-muted)]">
                      Podes alterar o voto até a fase de votação fechar.
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card key={category.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-[var(--color-fire)]" />
                    {category.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {memberList.map((member) => (
                    <MemberVoteOption
                      key={member.id}
                      isDisabled={!isVotingPhase || Boolean(savingVoteKey)}
                      isSaving={savingVoteKey === `member:${category.id}:${member.id}`}
                      isSelected={selectedMemberByCategory.get(category.id) === member.id}
                      member={member}
                      onClick={() => void handleMemberVote(category.id, member.id)}
                    />
                  ))}

                  <p className="body-small text-[var(--color-text-muted)]">
                    O voto é anónimo, mas os admins conseguem ver a auditoria.
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function NomineeVoteOption({
  isDisabled,
  isSaving,
  isSelected,
  nominee,
  onClick,
}: Readonly<{
  isDisabled: boolean;
  isSaving: boolean;
  isSelected: boolean;
  nominee: NomineeDto;
  onClick: () => void;
}>) {
  const actionLabel = isSaving ? "A guardar..." : isSelected ? "Selecionado" : "Votar";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "canhoes-tap canhoes-list-item flex w-full items-center gap-3 p-3 text-left",
        isSelected && "border-[var(--color-beige)]/35 bg-[rgba(107,124,69,0.16)]",
        isDisabled && "cursor-not-allowed opacity-55"
      )}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
        {nominee.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/proxy${nominee.imageUrl}`}
            alt={nominee.title}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[var(--color-text-primary)]">{nominee.title}</p>
        <p className="body-small text-[var(--color-text-muted)]">
          {isSelected ? "Este é o teu voto actual." : "Toca para votar neste sticker."}
        </p>
      </div>

      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs font-semibold",
          isSelected
            ? "bg-[var(--color-moss)] text-[var(--color-text-primary)]"
            : "bg-white/10 text-[var(--color-beige)]"
        )}
      >
        {actionLabel}
      </span>
    </button>
  );
}

function MemberVoteOption({
  isDisabled,
  isSaving,
  isSelected,
  member,
  onClick,
}: Readonly<{
  isDisabled: boolean;
  isSaving: boolean;
  isSelected: boolean;
  member: PublicUserDto;
  onClick: () => void;
}>) {
  const actionLabel = isSaving ? "A guardar..." : isSelected ? "Selecionado" : "Votar";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "canhoes-tap canhoes-list-item flex w-full items-center justify-between gap-3 p-3 text-left",
        isSelected && "border-[var(--color-beige)]/35 bg-[rgba(107,124,69,0.16)]",
        isDisabled && "cursor-not-allowed opacity-55"
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--color-text-primary)]">{member.displayName ?? member.email}</p>
        <p className="body-small truncate text-[var(--color-text-muted)]">{member.email}</p>
      </div>

      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs font-semibold",
          isSelected
            ? "bg-[var(--color-brown)] text-[var(--color-text-primary)]"
            : "bg-white/10 text-[var(--color-beige)]"
        )}
      >
        {actionLabel}
      </span>
    </button>
  );
}
