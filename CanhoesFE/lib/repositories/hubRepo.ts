import { canhoesFetch } from "@/lib/api/canhoesClient";
import type * as T from "@/lib/api/types";

/**
 * Hub / Feed API repository
 */
export const hubRepo = {
  getPosts: (take: number = 25) =>
    canhoesFetch<T.HubPostDto[]>(`/hub/posts?take=${take}`),

  uploadImages: async (files: File[]) => {
    const fd = new FormData();
    for (const f of files.slice(0, 10)) fd.append("files", f);
    return canhoesFetch<string[]>("/hub/uploads", {
      method: "POST",
      // IMPORTANT: do not set Content-Type; browser will set boundary
      body: fd,
    });
  },

  createPost: (payload: T.CreateHubPostRequest) =>
    canhoesFetch<T.HubPostDto>("/hub/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  toggleLike: (postId: string) =>
    canhoesFetch<{ liked: boolean }>(`/hub/posts/${postId}/like`, {
      method: "POST",
    }),

  toggleReaction: (postId: string, emoji: string) =>
    canhoesFetch<{ emoji: string; active: boolean }>(`/hub/posts/${postId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji } satisfies T.ToggleReactionRequest),
    }),

  votePoll: (postId: string, optionId: string) =>
    canhoesFetch<{ optionId: string }>(`/hub/posts/${postId}/poll/vote`, {
      method: "POST",
      body: JSON.stringify({ optionId } satisfies T.VotePollRequest),
    }),

  getComments: (postId: string) =>
    canhoesFetch<T.HubCommentDto[]>(`/hub/posts/${postId}/comments`),

  createComment: (postId: string, payload: T.CreateHubCommentRequest) =>
    canhoesFetch<T.HubCommentDto>(`/hub/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  toggleCommentReaction: (postId: string, commentId: string, emoji: string) =>
    canhoesFetch<{ emoji: string; active: boolean }>(`/hub/posts/${postId}/comments/${commentId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji } satisfies T.ToggleReactionRequest),
    }),

  // Admin
  adminTogglePin: (postId: string) =>
    canhoesFetch<{ pinned: boolean }>(`/hub/admin/posts/${postId}/pin`, {
      method: "POST",
    }),

  adminDeletePost: (postId: string) =>
    canhoesFetch<void>(`/hub/admin/posts/${postId}`, {
      method: "DELETE",
    }),
};

