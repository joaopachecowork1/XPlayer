import { xplayerFetch } from "@/lib/api/xplayerClient";
import type * as T from "@/lib/api/types";

/**
 * Hub / Feed API repository
 */
export const hubRepo = {
  getPosts: (take: number = 25) =>
    xplayerFetch<T.HubPostDto[]>(`/hub/posts?take=${take}`),

  uploadImages: async (files: File[]) => {
    const fd = new FormData();
    for (const f of files.slice(0, 10)) fd.append("files", f);
    return xplayerFetch<string[]>("/hub/uploads", {
      method: "POST",
      // IMPORTANT: do not set Content-Type; browser will set boundary
      body: fd as any,
    });
  },

  createPost: (payload: T.CreateHubPostRequest) =>
    xplayerFetch<T.HubPostDto>("/hub/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  toggleLike: (postId: string) =>
    xplayerFetch<{ liked: boolean }>(`/hub/posts/${postId}/like`, {
      method: "POST",
    }),

  toggleReaction: (postId: string, emoji: string) =>
    xplayerFetch<{ emoji: string; active: boolean }>(`/hub/posts/${postId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji } satisfies T.ToggleReactionRequest),
    }),

  votePoll: (postId: string, optionId: string) =>
    xplayerFetch<{ optionId: string }>(`/hub/posts/${postId}/poll/vote`, {
      method: "POST",
      body: JSON.stringify({ optionId } satisfies T.VotePollRequest),
    }),

  getComments: (postId: string) =>
    xplayerFetch<T.HubCommentDto[]>(`/hub/posts/${postId}/comments`),

  createComment: (postId: string, payload: T.CreateHubCommentRequest) =>
    xplayerFetch<T.HubCommentDto>(`/hub/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Admin
  adminTogglePin: (postId: string) =>
    xplayerFetch<{ pinned: boolean }>(`/hub/admin/posts/${postId}/pin`, {
      method: "POST",
    }),

  adminDeletePost: (postId: string) =>
    xplayerFetch<void>(`/hub/admin/posts/${postId}`, {
      method: "DELETE",
    }),
};
