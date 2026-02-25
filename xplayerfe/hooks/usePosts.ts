
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Api from '../lib/api';
import type { Post } from '../domain/types';

export function usePosts() {
  return useQuery<Post[]>({ queryKey: ['posts'], queryFn: Api.listPosts });
}

export function useVote(postId: string | number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: string | number) => Api.votePoll(postId, optionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
