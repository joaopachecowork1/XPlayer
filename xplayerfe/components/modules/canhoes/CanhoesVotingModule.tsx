"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { canhoesRepo } from "@/lib/repositories/canhoesRepo";
import type { AwardCategoryDto, CanhoesStateDto, NomineeDto, VoteDto, PublicUserDto, UserVoteDto } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Cigarette, Flame, Trophy } from "lucide-react";

export function CanhoesVotingModule() {
  const { user } = useAuth();
  const [state, setState] = useState<CanhoesStateDto | null>(null);
  const [categories, setCategories] = useState<AwardCategoryDto[]>([]);
  const [nominees, setNominees] = useState<NomineeDto[]>([]);
  const [myVotes, setMyVotes] = useState<VoteDto[]>([]);
  const [users, setUsers] = useState<PublicUserDto[]>([]);
  const [myUserVotes, setMyUserVotes] = useState<UserVoteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [st, cats, noms, votes, u, uv] = await Promise.all([
        canhoesRepo.getState(),
        canhoesRepo.getCategories(),
        canhoesRepo.getNominees(),
        canhoesRepo.myVotes(),
        canhoesRepo.getMembers(),
        canhoesRepo.myUserVotes(),
      ]);
      setState(st);
      setCategories(cats);
      // Voting list: only approved nominees.
      setNominees(noms.filter((n) => n.status === "approved"));
      setMyVotes(votes);
      // You cannot vote in yourself (also enforced on backend).
      setUsers(u.filter((m) => m.id !== user?.id));
      setMyUserVotes(uv);
    } catch (e) {
      // Never crash UI due to a failing fetch.
      console.error(e);
      setState(null);
      setCategories([]);
      setNominees([]);
      setMyVotes([]);
      setUsers([]);
      setMyUserVotes([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const byCategory = useMemo(() => {
    const map = new Map<string, NomineeDto[]>();
    for (const n of nominees) {
      if (!n.categoryId) continue;
      const arr = map.get(n.categoryId) ?? [];
      arr.push(n);
      map.set(n.categoryId, arr);
    }
    return map;
  }, [nominees]);

  const myVoteByCategory = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of myVotes) m.set(v.categoryId, v.nomineeId);
    return m;
  }, [myVotes]);

  const myUserVoteByCategory = useMemo(() => {
    const m = new Map<string, string>();
    for (const v of myUserVotes) m.set(v.categoryId, v.targetUserId);
    return m;
  }, [myUserVotes]);

  const isVoting = state?.phase === "voting";

  const castVote = async (categoryId: string, nomineeId: string) => {
    if (state?.phase !== "voting") return;
    setSaving(`${categoryId}:${nomineeId}`);
    try {
      await canhoesRepo.castVote({ categoryId, nomineeId });
      const votes = await canhoesRepo.myVotes();
      setMyVotes(votes);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  };

  const castUserVote = async (categoryId: string, targetUserId: string) => {
    if (state?.phase !== "voting") return;
    if (targetUserId === user?.id) return;
    setSaving(`u:${categoryId}:${targetUserId}`);
    try {
      await canhoesRepo.castUserVote({ categoryId, targetUserId });
      setMyUserVotes(await canhoesRepo.myUserVotes());
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1
          className="canhoes-title inline-flex items-center gap-2"
          style={{ fontSize: "17px" }}
        >
          <Trophy className="h-5 w-5" style={{ color: "#ffe135" }} />Votação
        </h1>
        {state && (
          <Badge variant="outline">
            {state.phase === "voting" ? "Votações abertas" : "Votações fechadas"}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">A carregar...</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            // 1) Sticker categories: vote in nominees (images)
            if (cat.kind === "Sticker") {
              const list = byCategory.get(cat.id) ?? [];
              if (list.length === 0) return null;
              const selected = myVoteByCategory.get(cat.id);

              return (
                <Card key={cat.id} className="canhoes-glass rounded-2xl">
                  <CardHeader className="pb-1.5">
                    <CardTitle className="text-base inline-flex items-center gap-2"><Cigarette className="h-4 w-4 text-orange-300" />{cat.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {list.map((n) => {
                      const isSelected = selected === n.id;
                      const busy = saving === `${cat.id}:${n.id}`;
                      let voteCta = "Votar";
                      if (busy) {
                        voteCta = "A guardar...";
                      } else if (isSelected) {
                        voteCta = "Selecionado";
                      }
                      return (
                        <button
                          key={n.id}
                          onClick={() => void castVote(cat.id, n.id)}
                          disabled={!isVoting || Boolean(saving)}
                          className={cn(
                            "canhoes-tap flex items-center gap-2.5 rounded-xl border p-2 text-left transition hover:bg-primary/10",
                            isSelected ? "border-jungle-300 bg-jungle-500/20" : "border-jungle-400/30 hover:border-jungle-300",
                            (!isVoting || Boolean(saving)) && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="h-12 w-12 overflow-hidden rounded-md bg-background/60 border border-jungle-400/30">
                            {n.imageUrl ? (
                              <img
                                src={`/api/proxy${n.imageUrl}`}
                                alt={n.title}
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium text-jungle-100">{n.title}</div>
                            {isSelected && <div className="text-xs text-jungle-300">✓ O teu voto</div>}
                          </div>
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap",
                            isSelected ? "bg-jungle-500/60 text-jungle-100" : "bg-jungle-400/20 text-jungle-200"
                          )}>
                            {voteCta}
                          </span>
                        </button>
                      );
                    })}
                    <div className="text-xs text-muted-foreground">Podes alterar o voto até a fase de votação fechar.</div>
                  </CardContent>
                </Card>
              );
            }

            // 2) UserVote categories: vote directly in a person
            const selectedUserId = myUserVoteByCategory.get(cat.id);
            return (
              <Card key={cat.id} className="canhoes-glass rounded-2xl">
                <CardHeader className="pb-1.5">
                  <CardTitle className="text-base inline-flex items-center gap-2"><Flame className="h-4 w-4 text-orange-300" />{cat.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  {users.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    const busy = saving === `u:${cat.id}:${u.id}`;
                    let voteCta = "Votar";
                    if (busy) {
                      voteCta = "A guardar...";
                    } else if (isSelected) {
                      voteCta = "Selecionado";
                    }
                    return (
                      <button
                        key={u.id}
                        onClick={() => void castUserVote(cat.id, u.id)}
                        disabled={!isVoting || Boolean(saving)}
                        className={cn(
                          "canhoes-tap flex items-center justify-between gap-2.5 rounded-xl border p-2.5 text-left transition hover:bg-magenta-500/10",
                          isSelected ? "border-magenta-400 bg-magenta-500/15" : "border-magenta-400/30 hover:border-magenta-400",
                          (!isVoting || Boolean(saving)) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-jungle-100">{u.displayName ?? u.email}</div>
                          <div className="text-xs text-jungle-300/80 truncate">{u.email}</div>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap",
                          isSelected ? "bg-magenta-500/60 text-magenta-100" : "bg-magenta-400/20 text-magenta-200"
                        )}>
                          {voteCta}
                        </span>
                      </button>
                    );
                  })}
                  <div className="text-xs text-muted-foreground">Voto anónimo (admins podem ver auditoria).</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
