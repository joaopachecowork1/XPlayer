import { canhoesFetch } from "@/lib/api";
import type * as T from "@/lib/api/types";

/**
 * Canhões do Ano API Repository
 *
 * Architecture: UI → Repository → canhoesFetch → /api/proxy → Backend
 * One function = one endpoint (junior-friendly)
 */
export const canhoesRepo = {
  // ==========================================
  // PUBLIC - Event State & Categories
  // ==========================================

  getState: () => canhoesFetch<T.CanhoesStateDto>("/canhoes/state"),

  getCategories: () => canhoesFetch<T.AwardCategoryDto[]>("/canhoes/categories"),

  getMeasures: () => canhoesFetch<T.GalaMeasureDto[]>("/canhoes/measures"),

  getResults: () => canhoesFetch<T.CanhoesCategoryResultDto[]>("/canhoes/results"),

  // ==========================================
  // PUBLIC - Nominees
  // ==========================================

  getNominees: (categoryId?: string) =>
    canhoesFetch<T.NomineeDto[]>(
      `/canhoes/nominees${categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ""}`
    ),

  createNominee: (payload: T.CreateNomineeRequest) =>
    canhoesFetch<T.NomineeDto>("/canhoes/nominees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadNomineeImage: async (nomineeId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/canhoes/nominees/${nomineeId}/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
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
    canhoesFetch<T.CategoryProposalDto>("/canhoes/categories/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createMeasureProposal: (payload: T.CreateMeasureProposalRequest) =>
    canhoesFetch<T.MeasureProposalDto>("/canhoes/measures/proposals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // PUBLIC - Voting
  // ==========================================

  myVotes: () => canhoesFetch<T.VoteDto[]>("/canhoes/my-votes"),

  castVote: (payload: T.CastVoteRequest) =>
    canhoesFetch<T.VoteDto>("/canhoes/vote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  myUserVotes: () => canhoesFetch<T.UserVoteDto[]>("/canhoes/my-user-votes"),

  castUserVote: (payload: T.CastUserVoteRequest) =>
    canhoesFetch<T.UserVoteDto>("/canhoes/user-vote", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // PUBLIC - Members
  // ==========================================

  getMembers: () => canhoesFetch<T.PublicUserDto[]>("/canhoes/members"),

  // ==========================================
  // PUBLIC - Wishlist
  // ==========================================

  getWishlist: () => canhoesFetch<T.WishlistItemDto[]>("/canhoes/wishlist"),

  createWishlistItem: (payload: T.CreateWishlistItemRequest) =>
    canhoesFetch<T.WishlistItemDto>("/canhoes/wishlist", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteWishlistItem: (id: string) =>
    canhoesFetch<void>(`/canhoes/wishlist/${id}`, { method: "DELETE" }),

  uploadWishlistImage: async (itemId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/proxy/canhoes/wishlist/${itemId}/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.text().catch(() => "")) || res.statusText);
  },

  // ==========================================
  // PUBLIC - Secret Santa
  // ==========================================

  getSecretSantaMe: (eventCode?: string) =>
    canhoesFetch<T.SecretSantaMeDto>(
      `/canhoes/secret-santa/me${eventCode ? `?eventCode=${encodeURIComponent(eventCode)}` : ""}`
    ),

  // ==========================================
  // ADMIN - Secret Santa
  // ==========================================

  adminDrawSecretSanta: (payload: T.CreateSecretSantaDrawRequest) =>
    canhoesFetch<T.SecretSantaDrawDto>("/canhoes/secret-santa/draw", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ==========================================
  // ADMIN - Pending Approvals
  // ==========================================

  adminGetAllNominees: (status?: string) =>
    canhoesFetch<T.NomineeDto[]>(
      `/canhoes/admin/nominees${status ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  adminPending: () => canhoesFetch<T.PendingAdminDto>("/canhoes/admin/pending"),

  approveNominee: (id: string) =>
    canhoesFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/approve`, { method: "POST" }),

  rejectNominee: (id: string) =>
    canhoesFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/reject`, { method: "POST" }),

  adminSetNomineeCategory: (id: string, payload: T.SetNomineeCategoryRequest) =>
    canhoesFetch<T.NomineeDto>(`/canhoes/admin/nominees/${id}/set-category`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminApproveCategoryProposal: (id: string) =>
    canhoesFetch<T.AwardCategoryDto>(`/canhoes/admin/categories/${id}/approve`, { method: "POST" }),

  adminRejectCategoryProposal: (id: string) =>
    canhoesFetch<T.CategoryProposalDto>(`/canhoes/admin/categories/${id}/reject`, { method: "POST" }),

  adminApproveMeasureProposal: (id: string) =>
    canhoesFetch<T.GalaMeasureDto>(`/canhoes/admin/measures/${id}/approve`, { method: "POST" }),

  adminRejectMeasureProposal: (id: string) =>
    canhoesFetch<T.MeasureProposalDto>(`/canhoes/admin/measures/${id}/reject`, { method: "POST" }),

  adminListMeasureProposals: (status?: "pending" | "approved" | "rejected" | "all") =>
    canhoesFetch<T.MeasureProposalDto[]>(
      `/canhoes/admin/measures/proposals${status && status !== "all" ? `?status=${encodeURIComponent(status)}` : ""}`
    ),

  adminUpdateMeasureProposal: (id: string, payload: T.UpdateMeasureProposalRequest) =>
    canhoesFetch<T.MeasureProposalDto>(`/canhoes/admin/measures/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  adminDeleteMeasureProposal: (id: string) =>
    canhoesFetch<void>(`/canhoes/admin/measures/${id}`, { method: "DELETE" }),

  // ==========================================
  // ADMIN - Categories & State
  // ==========================================

  adminGetAllCategories: () => canhoesFetch<T.AwardCategoryDto[]>("/canhoes/admin/categories"),

  adminCreateCategory: (payload: T.CreateAwardCategoryRequest) =>
    canhoesFetch<T.AwardCategoryDto>("/canhoes/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminUpdateCategory: (id: string, payload: T.UpdateAwardCategoryRequest) =>
    canhoesFetch<T.AwardCategoryDto>(`/canhoes/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  updateState: (state: T.CanhoesStateDto) =>
    canhoesFetch<T.CanhoesStateDto>("/canhoes/admin/state", {
      method: "POST",
      body: JSON.stringify(state),
    }),

  // ==========================================
  // ADMIN - Votes Overview
  // ==========================================

  adminVotes: () =>
    canhoesFetch<{
      total: number;
      votes: {
        categoryId: string;
        nomineeId: string;
        userId: string;
        updatedAtUtc: string;
      }[];
    }>("/canhoes/admin/votes"),

  // ==========================================
  // ADMIN - Proposals History (approved/rejected/pending)
  // ==========================================

  adminProposalsHistory: () =>
    canhoesFetch<{
      categoryProposals:
        | T.CategoryProposalDto[]
        | { pending?: T.CategoryProposalDto[]; approved?: T.CategoryProposalDto[]; rejected?: T.CategoryProposalDto[] };
      measureProposals:
        | T.MeasureProposalDto[]
        | { pending?: T.MeasureProposalDto[]; approved?: T.MeasureProposalDto[]; rejected?: T.MeasureProposalDto[] };
    }>("/canhoes/admin/proposals"),
};

export default canhoesRepo;
