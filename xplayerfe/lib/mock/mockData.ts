/**
 * Realistic mock data fixtures for Canhões do Ano.
 *
 * These are used when NEXT_PUBLIC_MOCK_AUTH=true so developers can
 * work on the UI without a running backend.
 */

import type {
  AwardCategoryDto,
  CanhoesStateDto,
  NomineeDto,
  CategoryProposalDto,
  MeasureProposalDto,
  PublicUserDto,
  HubPostDto,
} from "@/lib/api/types";

// ─── State ───────────────────────────────────────────────────────────────────

export const MOCK_STATE: CanhoesStateDto = {
  phase: "nominations",
  nominationsVisible: true,
  resultsVisible: false,
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: AwardCategoryDto[] = [
  {
    id: "cat-001",
    name: "Melhor Álbum",
    sortOrder: 1,
    isActive: true,
    kind: "Sticker",
    description: "O álbum que mais marcou o ano",
  },
  {
    id: "cat-002",
    name: "Melhor Faixa",
    sortOrder: 2,
    isActive: true,
    kind: "Sticker",
    description: "A música que esteve em loop durante o ano",
  },
  {
    id: "cat-003",
    name: "Melhor Concerto",
    sortOrder: 3,
    isActive: true,
    kind: "Sticker",
    description: "O concerto que ficou na memória",
  },
  {
    id: "cat-004",
    name: "Revelação do Ano",
    sortOrder: 4,
    isActive: true,
    kind: "Sticker",
    description: "O artista que surpreendeu toda a gente",
  },
  {
    id: "cat-005",
    name: "Mais Provável a Tornar-se Admin",
    sortOrder: 5,
    isActive: true,
    kind: "UserVote",
    voteQuestion: "Quem é o próximo admin?",
    voteRules: "Votação por membro do grupo",
  },
  {
    id: "cat-006",
    name: "Melhor Videoclipe",
    sortOrder: 6,
    isActive: false,
    kind: "Sticker",
    description: "Categoria arquivada",
  },
];

// ─── Nominees ────────────────────────────────────────────────────────────────

export const MOCK_NOMINEES: NomineeDto[] = [
  {
    id: "nom-001",
    categoryId: "cat-001",
    title: "SOS — ABBA",
    status: "approved",
    createdAtUtc: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "nom-002",
    categoryId: "cat-001",
    title: "Midnights — Taylor Swift",
    status: "approved",
    createdAtUtc: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "nom-003",
    categoryId: "cat-002",
    title: "Flowers — Miley Cyrus",
    status: "pending",
    createdAtUtc: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "nom-004",
    categoryId: "cat-002",
    title: "As It Was — Harry Styles",
    status: "pending",
    createdAtUtc: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "nom-005",
    categoryId: null,
    title: "Nomeação sem categoria",
    status: "pending",
    createdAtUtc: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "nom-006",
    categoryId: "cat-003",
    title: "Coldplay — Music of the Spheres Tour",
    status: "rejected",
    createdAtUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// ─── Category Proposals ──────────────────────────────────────────────────────

export const MOCK_CATEGORY_PROPOSALS: CategoryProposalDto[] = [
  {
    id: "cprop-001",
    name: "Melhor Documentário Musical",
    description: "Documentários sobre bandas, artistas, ou a indústria musical",
    status: "pending",
    createdAtUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "cprop-002",
    name: "Pior Música do Ano",
    description: "Infelizmente também existe este prémio",
    status: "pending",
    createdAtUtc: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "cprop-003",
    name: "Melhor Collab",
    description: "A melhor colaboração entre dois ou mais artistas",
    status: "approved",
    createdAtUtc: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "cprop-004",
    name: "Melhor Playlist",
    description: "A playlist perfeita para uma tarde de domingo",
    status: "rejected",
    createdAtUtc: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

// ─── Measure Proposals ───────────────────────────────────────────────────────

export const MOCK_MEASURE_PROPOSALS: MeasureProposalDto[] = [
  {
    id: "mprop-001",
    text: "Quem não votar em todas as categorias paga a ronda",
    status: "pending",
    createdAtUtc: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "mprop-002",
    text: "O vencedor de cada categoria dá um brinde ao grupo",
    status: "approved",
    createdAtUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "mprop-003",
    text: "Quem nomear a pior música do ano tem que a ouvir em público",
    status: "pending",
    createdAtUtc: new Date(Date.now() - 1800000).toISOString(),
  },
];

// ─── Members ─────────────────────────────────────────────────────────────────

export const MOCK_MEMBERS: PublicUserDto[] = [
  {
    id: "mock-admin-001",
    email: "admin@dev.local",
    displayName: "Dev Admin",
    isAdmin: true,
  },
  {
    id: "user-002",
    email: "joao@dev.local",
    displayName: "João P.",
    isAdmin: false,
  },
  {
    id: "user-003",
    email: "maria@dev.local",
    displayName: "Maria S.",
    isAdmin: false,
  },
  {
    id: "user-004",
    email: "pedro@dev.local",
    displayName: "Pedro M.",
    isAdmin: false,
  },
];

// ─── Hub Posts ───────────────────────────────────────────────────────────────

export const MOCK_HUB_POSTS: HubPostDto[] = [
  {
    id: "post-001",
    authorUserId: "user-002",
    authorName: "João P.",
    text: "🎵 Finalmente começaram as nomeações! Quem é o vosso álbum favorito do ano?",
    mediaUrl: null,
    mediaUrls: [],
    isPinned: true,
    likedByMe: false,
    likeCount: 3,
    commentCount: 2,
    reactionCounts: { "❤️": 3, "🔥": 2 },
    myReactions: [],
    createdAtUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
    poll: null,
  },
  {
    id: "post-002",
    authorUserId: "user-003",
    authorName: "Maria S.",
    text: "Já nomeei o meu top 3 🏆 Estão todos a dormir?",
    mediaUrl: null,
    mediaUrls: [],
    isPinned: false,
    likedByMe: true,
    likeCount: 5,
    commentCount: 1,
    reactionCounts: { "❤️": 5, "😂": 1 },
    myReactions: ["❤️"],
    createdAtUtc: new Date(Date.now() - 1800000).toISOString(),
    poll: null,
  },
];

// ─── Pending Admin ────────────────────────────────────────────────────────────

export const MOCK_PENDING = {
  nominees: MOCK_NOMINEES.filter((n) => n.status === "pending"),
  categoryProposals: MOCK_CATEGORY_PROPOSALS.filter(
    (p) => p.status === "pending"
  ),
  measureProposals: MOCK_MEASURE_PROPOSALS.filter(
    (p) => p.status === "pending"
  ),
};

// ─── Votes Audit ─────────────────────────────────────────────────────────────

export const MOCK_VOTES = {
  total: 4,
  votes: [
    {
      categoryId: "cat-001",
      nomineeId: "nom-001",
      userId: "user-002",
      updatedAtUtc: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      categoryId: "cat-001",
      nomineeId: "nom-002",
      userId: "user-003",
      updatedAtUtc: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      categoryId: "cat-002",
      nomineeId: "nom-003",
      userId: "user-004",
      updatedAtUtc: new Date(Date.now() - 900000).toISOString(),
    },
    {
      categoryId: "cat-002",
      nomineeId: "nom-004",
      userId: "mock-admin-001",
      updatedAtUtc: new Date(Date.now() - 600000).toISOString(),
    },
  ],
};

// ─── Proposals History ────────────────────────────────────────────────────────

export const MOCK_PROPOSALS_HISTORY = {
  categoryProposals: MOCK_CATEGORY_PROPOSALS,
  measureProposals: MOCK_MEASURE_PROPOSALS,
};
