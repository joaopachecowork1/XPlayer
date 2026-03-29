export type SessionDto = {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  platform?: string | null;
  startedAt: string; // ISO
  endedAt?: string | null; // ISO
  durationSeconds?: number | null;
  xpEarned?: number | null;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
};

export type BacklogGameDto = {
  userId: string;
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  totalPlaySeconds: number;
  totalXP: number;
  sessionsCount: number;
  lastPlayedAt?: string | null; // ISO
};

export type StartSessionRequest = {
  gameId: string;
  gameName: string;
  coverUrl?: string | null;
  released?: string | null;
  score?: number | null;
  platform?: string | null;
  startedAt?: string | null; // allow client to pass ISO; backend may ignore
};

export type StopSessionRequest = {
  endedAt?: string | null; // ISO
  /** Total seconds the session was paused. Sent to the server for accurate active play time. */
  pausedSeconds?: number | null;
};

export type CanhoesPhase = "nominations" | "voting" | "locked" | "gala";

export type CanhoesStateDto = {
  phase: CanhoesPhase;
  nominationsVisible: boolean;
  resultsVisible: boolean;
};

export type AwardCategoryDto = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  kind: "Sticker" | "UserVote";
  eligibleUsers?: PublicUserDto[];
  description?: string | null;
  voteQuestion?: string | null;
  voteRules?: string | null;
};

export type CreateAwardCategoryRequest = {
  name: string;
  sortOrder?: number | null;
  kind: "Sticker" | "UserVote";
};
export type UserVoteDto = {
  id: string;
  categoryId: string;
  voterUserId: string;
  targetUserId: string;
  updatedAtUtc: string;
};

export type CastUserVoteRequest = {
  categoryId: string;
  targetUserId: string;
};

export type NomineeDto = {
  id: string;
  categoryId?: string | null;
  title: string;
  imageUrl?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAtUtc: string;
};

export type CreateNomineeRequest = {
  categoryId?: string | null;
  title: string;
};

export type CategoryProposalDto = {
  id: string;
  name: string;
  description?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAtUtc: string;
};

export type CreateCategoryProposalRequest = {
  name: string;
  description?: string | null;
};

export type GalaMeasureDto = {
  id: string;
  text: string;
  isActive: boolean;
  createdAtUtc: string;
};

export type MeasureProposalDto = {
  id: string;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAtUtc: string;
};

export type CreateMeasureProposalRequest = {
  text: string;
};

export type UpdateMeasureProposalRequest = {
  text?: string | null;
  status?: "pending" | "approved" | "rejected" | null;
};

export type PendingAdminDto = {
  nominees: NomineeDto[];
  categoryProposals: CategoryProposalDto[];
  measureProposals: MeasureProposalDto[];
};

export type SetNomineeCategoryRequest = {
  categoryId?: string | null;
};

export type CanhoesResultNomineeDto = {
  nomineeId: string;
  categoryId?: string | null;
  title: string;
  imageUrl?: string | null;
  votes: number;
};

export type CanhoesCategoryResultDto = {
  categoryId: string;
  categoryName: string;
  totalVotes: number;
  top: CanhoesResultNomineeDto[]; // top 3
};

export type VoteDto = {
  id: string;
  categoryId: string;
  nomineeId: string;
  updatedAtUtc: string;
};

export type CastVoteRequest = {
  categoryId: string;
  nomineeId: string;
};


export type PublicUserDto = {
  id: string;
  email: string;
  displayName?: string | null;
  isAdmin: boolean;
};

export type WishlistItemDto = {
  id: string;
  userId: string;
  title: string;
  url?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type CreateWishlistItemRequest = {
  title: string;
  url?: string | null;
  notes?: string | null;
};

export type SecretSantaDrawDto = {
  id: string;
  eventCode: string;
  createdAtUtc: string;
  isLocked: boolean;
};

export type SecretSantaMeDto = {
  drawId: string;
  eventCode: string;
  receiver: PublicUserDto;
};

export type CreateSecretSantaDrawRequest = {
  eventCode?: string | null;
};


// ------------------------------
// Hub / Feed
// ------------------------------

export type HubPostDto = {
  id: string;
  authorUserId: string;
  authorName: string;
  text: string;
  mediaUrl?: string | null;
  mediaUrls: string[];
  isPinned: boolean;
  likedByMe: boolean;
  likeCount: number;
  commentCount: number;
  reactionCounts: Record<string, number>;
  myReactions: string[];
  createdAtUtc: string;

  poll?: HubPollDto | null;
};

export type HubPollOptionDto = {
  id: string;
  text: string;
  voteCount: number;
};

export type HubPollDto = {
  question: string;
  options: HubPollOptionDto[];
  myOptionId?: string | null;
  totalVotes: number;
};

export type HubCommentDto = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  text: string;
  createdAtUtc: string;
  reactionCounts: Record<string, number>;
  myReactions: string[];
};

export type CreateHubPostRequest = {
  text: string;
  mediaUrl?: string | null;
  mediaUrls?: string[] | null;

  pollQuestion?: string | null;
  pollOptions?: string[] | null;
};

export type VotePollRequest = {
  optionId: string;
};

export type ToggleReactionRequest = {
  emoji: string;
};

export type CreateHubCommentRequest = {
  text: string;
};


// ------------------------------
// Admin helper types
// ------------------------------

export type UpdateAwardCategoryRequest = {
  name?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  kind?: string | null;
  description?: string | null;
  voteQuestion?: string | null;
  voteRules?: string | null;
};

// ------------------------------
// Events v1
// ------------------------------

export type EventSummaryDto = {
  id: string;
  name: string;
  isActive: boolean;
};

export type EventUserDto = {
  id: string;
  name: string;
  role: "admin" | "user";
};

export type EventPhaseDto = {
  id: string;
  type: "DRAW" | "PROPOSALS" | "VOTING" | "RESULTS";
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type EventContextDto = {
  event: EventSummaryDto;
  users: EventUserDto[];
  phases: EventPhaseDto[];
  activePhase?: EventPhaseDto | null;
};

export type EventPermissionsDto = {
  isAdmin: boolean;
  isMember: boolean;
  canPost: boolean;
  canSubmitProposal: boolean;
  canVote: boolean;
  canManage: boolean;
};

export type EventCountsDto = {
  memberCount: number;
  feedPostCount: number;
  categoryCount: number;
  pendingProposalCount: number;
  wishlistItemCount: number;
};

export type EventModulesDto = {
  feed: boolean;
  secretSanta: boolean;
  wishlist: boolean;
  categories: boolean;
  voting: boolean;
  gala: boolean;
  stickers: boolean;
  measures: boolean;
  nominees: boolean;
  admin: boolean;
};

export type EventOverviewDto = {
  event: EventSummaryDto;
  activePhase?: EventPhaseDto | null;
  nextPhase?: EventPhaseDto | null;
  permissions: EventPermissionsDto;
  counts: EventCountsDto;
  hasSecretSantaDraw: boolean;
  hasSecretSantaAssignment: boolean;
  myWishlistItemCount: number;
  myProposalCount: number;
  myVoteCount: number;
  votingCategoryCount: number;
  modules: EventModulesDto;
};

export type EventVotingOverviewDto = {
  eventId: string;
  phaseId?: string | null;
  canVote: boolean;
  endsAt?: string | null;
  categoryCount: number;
  submittedVoteCount: number;
  remainingVoteCount: number;
};

export type EventSecretSantaOverviewDto = {
  eventId: string;
  hasDraw: boolean;
  hasAssignment: boolean;
  drawEventCode?: string | null;
  assignedUser?: EventUserDto | null;
  assignedWishlistItemCount: number;
  myWishlistItemCount: number;
};

export type EventFeedPostDto = {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
};

export type CreateEventPostRequest = {
  content: string;
  imageUrl?: string | null;
};

export type EventCategoryDto = {
  id: string;
  eventId: string;
  title: string;
  kind: "Sticker" | "UserVote";
  isActive: boolean;
  description?: string | null;
};

export type CreateEventCategoryRequest = {
  title: string;
  description?: string | null;
  kind: "Sticker" | "UserVote";
  sortOrder?: number | null;
};

export type EventVoteOptionDto = {
  id: string;
  categoryId: string;
  label: string;
};

export type EventVotingCategoryDto = {
  id: string;
  eventId: string;
  title: string;
  kind: "Sticker" | "UserVote";
  description?: string | null;
  voteQuestion?: string | null;
  options: EventVoteOptionDto[];
  myOptionId?: string | null;
};

export type EventVotingBoardDto = {
  eventId: string;
  phaseId?: string | null;
  canVote: boolean;
  categories: EventVotingCategoryDto[];
};

export type CreateEventVoteRequest = {
  categoryId: string;
  optionId: string;
};

export type EventVoteDto = {
  id: string;
  userId: string;
  categoryId: string;
  optionId: string;
  phaseId: string;
};

export type EventProposalDto = {
  id: string;
  eventId: string;
  userId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type CreateEventProposalRequest = {
  content: string;
};

export type UpdateEventProposalRequest = {
  status: "pending" | "approved" | "rejected";
};

export type EventWishlistItemDto = {
  id: string;
  userId: string;
  eventId: string;
  title: string;
  link?: string | null;
  updatedAt: string;
};

export type CreateEventWishlistItemRequest = {
  title: string;
  link?: string | null;
};
