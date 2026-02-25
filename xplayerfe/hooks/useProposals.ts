
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { canhoesRepo } from '@/lib/repositories/canhoesRepo';
import type { Proposal } from '../domain/types';

export function useCategoryProposals(categoryId: string | number) {
  return useQuery<Proposal[]>({
    queryKey: ['category-proposals', categoryId],
    // Backend does not expose proposals by category; keep compatibility by using admin endpoints
    // when available. If you need per-category proposals, add a dedicated endpoint.
    queryFn: async () => {
      const resp: any = await (canhoesRepo as any).adminProposalsHistory?.();
      return (resp?.categoryProposals ?? []) as Proposal[];
    },
    enabled: !!categoryId,
  });
}

export function useCreateCategoryProposal(categoryId: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => canhoesRepo.createCategoryProposal({
      name: payload?.name ?? payload?.title ?? "",
      description: payload?.description ?? null,
    } as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['category-proposals', categoryId] });
    },
  });
}
