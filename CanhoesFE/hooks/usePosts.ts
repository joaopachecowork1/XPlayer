
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hubRepo } from '../lib/repositories/hubRepo';
import type { HubPostDto } from '../lib/api/types';

export function usePosts() {
  return useQuery<HubPostDto[]>({ queryKey: ['posts'], queryFn: () => hubRepo.getPosts() });
}

export function useVote(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: string) => hubRepo.votePoll(postId, optionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
