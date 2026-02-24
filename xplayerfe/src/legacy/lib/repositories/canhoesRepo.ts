import { xplayerFetch } from "@/lib/api/xplayerClient";
import type * as T from "@/lib/api/types";

/**
 * Canhões do Ano API Repository
 * 
 * Architecture: UI → Repository → xplayerFetch → /api/proxy → Backend
 * One function = one endpoint (junior-friendly)
 */
export const canhoesRepo = {
  // ==========================================
  // PUBLIC - Event State & Categories
  // ==========================================
  
  getState: () => 
    xplayerFetch<T.CanhoesStateDto>("/canhoes/state"),
  
  getCategories: () => 
    xplayerFetch<T.AwardCategoryDto[]>("/canhoes/categories"),
  
  getMeasures: () => 
    xplayerFetch<T.GalaMeasureDto[]>("/canhoes/measures"),
  
  getResults: () => 
    xplayerFetch<T.CanhoesCategoryResultDto[]>("/canhoes/results"),

  // ==========================================
  // PUBLIC - Nominees
  // ==========================================
  
  getNominees: (categoryId?: string) =>
    xplayerFetch<T.NomineeDto[]>(
      `/canhoes/nominees${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""}`
    ),
  
  createNominee: (payload: T.CreateNomineeRequest) =>
    xplayerFetch<T.NomineeDto>("/canhoes/nominees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  
  uploadNomineeImage: async (nomineeId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/canhoes/nominees/${nomineeId}/upload`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || res.statusText || "Upload failed");
    }
    const text = await res.text().catch(() => "");
    if (!text) return undefined;
    try {
      return JSON.parse(text) as T.NomineeDto;
    } catch {
      return undefined;
    }
  },

  // ==========================================
  // PUBLIC - Proposals
  // ==========================================
  
  createCategoryProposal: (payload: T.CreateCategoryProposalRequest) =>
    xplayerFetch<T.CategoryProposalDto>("/canhoes/categories/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  
  createMeasureProposal: (payload: T.CreateMeasureProposalRequest) =>
    xplayerFetch<T.MeasureProposalDto>("/canhoes/measures/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // PUBLIC - Voting
  // ==========================================
  
  myVotes: () => 
    xplayerFetch<T.VoteDto[]>("/canhoes/my-votes"),
  
  castVote: (payload: T.CastVoteRequest) =>
    xplayerFetch<T.VoteDto>("/canhoes/vote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  
  myUserVotes: () => 
    xplayerFetch<T.UserVoteDto[]>("/canhoes/my-user-votes"),
  
  castUserVote: (payload: T.CastUserVoteRequest) =>
    xplayerFetch<T.UserVoteDto>("/canhoes/user-vote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // PUBLIC - Members (isolated from main XPlayer user list)
  // ==========================================
  
  getMembers: () => 
    xplayerFetch<T.PublicUserDto[]>("/canhoes/members"),

  // ==========================================
  // PUBLIC - Wishlist
  // ==========================================
  
  getWishlist: () => 
    xplayerFetch<T.WishlistItemDto[]>("/canhoes/wishlist"),
  
  createWishlistItem: (payload: T.CreateWishlistItemRequest) =>
    xplayerFetch<T.WishlistItemDto>("/canhoes/wishlist", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  
  uploadWishlistImage: async (itemId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/canhoes/wishlist/${itemId}/upload`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error((await res.text().catch(() => "")) || res.statusText);
    }
  },

  // ==========================================
  // PUBLIC - Secret Santa
  // ==========================================
  
  /** Get my secret santa assignment for an event */
  getSecretSantaMe: (eventCode?: string) =>
    xplayerFetch<T.SecretSantaMeDto>(
      `/canhoes/secret-santa/me${eventCode ? `?eventCode=${encodeURIComponent(eventCode)}` : ""}`
    ),

  // ==========================================
  // ADMIN - Secret Santa
  // ==========================================
  
  /** 
   * Generate new secret santa draw (ADMIN ONLY)
   * WARNING: Deletes all previous draws for this event!
   */
  adminDrawSecretSanta: (payload: T.CreateSecretSantaDrawRequest) =>
    xplayerFetch<T.SecretSantaDrawDto>("/canhoes/secret-santa/draw", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // ADMIN - Pending Approvals
  // ==========================================
  
  adminPending: () => 
    xplayerFetch<T.PendingAdminDto>("/canhoes/admin/pending"),
  
  approveNominee: (id: string) => 
    xplayerFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/approve`, {
      method: "POST",
    }),
  
  rejectNominee: (id: string) => 
    xplayerFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/reject`, {
      method: "POST",
    }),
  
  adminSetNomineeCategory: (id: string, payload: T.SetNomineeCategoryRequest) =>
    xplayerFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/set-category`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  
  adminApproveCategoryProposal: (id: string) =>
    xplayerFetch<T.AwardCategoryDto>(`/canhoes/admin/categories/${id}/approve`, {
      method: "POST",
    }),
  
  adminRejectCategoryProposal: (id: string) =>
    xplayerFetch<T.CategoryProposalDto>(`/canhoes/admin/categories/${id}/reject`, {
      method: "POST",
    }),
  
  adminApproveMeasureProposal: (id: string) =>
    xplayerFetch<T.GalaMeasureDto>(`/canhoes/admin/measures/${id}/approve`, {
      method: "POST",
    }),
  
  adminRejectMeasureProposal: (id: string) =>
    xplayerFetch<T.MeasureProposalDto>(`/canhoes/admin/measures/${id}/reject`, {
      method: "POST",
    }),

  // ==========================================
  // ADMIN - Categories & State
  // ==========================================

  adminListCategories: () =>
    xplayerFetch<T.AwardCategoryDto[]>("/canhoes/admin/categories"),
  
  adminCreateCategory: (payload: T.CreateAwardCategoryRequest) =>
    xplayerFetch<T.AwardCategoryDto>("/canhoes/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminUpdateCategory: (id: string, payload: T.UpdateAwardCategoryRequest) =>
    xplayerFetch<T.AwardCategoryDto>(`/canhoes/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateState: (state: T.CanhoesStateDto) =>
    xplayerFetch<T.CanhoesStateDto>("/canhoes/admin/state", {
      method: "POST",
      body: JSON.stringify(state),
    }),

  // ==========================================
  // ADMIN - Votes Overview
  // ==========================================
  
  adminVotes: () =>
    xplayerFetch<{
      total: number;
      votes: {
        categoryId: string;
        nomineeId: string;
        userId: string;
        updatedAtUtc: string;
      }[];
    }>("/canhoes/admin/votes"),
};