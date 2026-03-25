/**
 * Mock fetch interceptor.
 *
 * When `IS_MOCK_MODE` is true this function is called instead of the real
 * network request.  It pattern-matches the proxy path (which looks like
 * `/api/proxy/canhoes/...`) and returns appropriate static fixtures.
 *
 * GET  → returns fixture data
 * POST/PUT/PATCH/DELETE → returns a minimal success payload
 */

import {
  MOCK_STATE,
  MOCK_CATEGORIES,
  MOCK_NOMINEES,
  MOCK_CATEGORY_PROPOSALS,
  MOCK_MEASURE_PROPOSALS,
  MOCK_MEMBERS,
  MOCK_HUB_POSTS,
  MOCK_PENDING,
  MOCK_VOTES,
  MOCK_PROPOSALS_HISTORY,
} from "./mockData";

/** Simulate a small network delay so skeletons are visible in dev. */
const MOCK_DELAY_MS = 120;

function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

/**
 * Returns mock data for a given proxy path + HTTP method.
 *
 * @param proxyPath - Full proxy path, e.g. `/api/proxy/canhoes/state`
 * @param method    - HTTP method in uppercase
 */
export async function getMockResponse<T>(
  proxyPath: string,
  method: string
): Promise<T> {
  await simulateNetworkDelay();

  // Normalise: strip leading `/api/proxy/`
  const path = proxyPath.replace(/^\/api\/proxy\//, "").replace(/^\//, "");
  const verb = (method || "GET").toUpperCase();

  // ── Write operations: return an optimistic success payload ──────────────────
  if (verb !== "GET") {
    return handleWrite<T>(path);
  }

  // ── Read operations ──────────────────────────────────────────────────────────
  return handleRead<T>(path);
}

function handleWrite<T>(path: string): T {
  // nominees approve/reject
  if (/^canhoes\/admin\/nominees\/.+\/approve$/.test(path)) {
    const id = path.split("/")[3];
    const nom = MOCK_NOMINEES.find((n) => n.id === id);
    return { ...(nom ?? {}), status: "approved" } as unknown as T;
  }
  if (/^canhoes\/admin\/nominees\/.+\/reject$/.test(path)) {
    const id = path.split("/")[3];
    const nom = MOCK_NOMINEES.find((n) => n.id === id);
    return { ...(nom ?? {}), status: "rejected" } as unknown as T;
  }

  // category proposal approve/reject
  if (/^canhoes\/admin\/categories\/.+\/approve$/.test(path)) {
    return MOCK_CATEGORIES[0] as unknown as T;
  }
  if (/^canhoes\/admin\/categories\/.+\/reject$/.test(path)) {
    return MOCK_CATEGORY_PROPOSALS[0] as unknown as T;
  }

  // measure proposal approve/reject
  if (/^canhoes\/admin\/measures\/.+\/approve$/.test(path)) {
    return { id: "mock-measure", text: "Mock measure", isActive: true, createdAtUtc: new Date().toISOString() } as unknown as T;
  }
  if (/^canhoes\/admin\/measures\/.+\/reject$/.test(path)) {
    return MOCK_MEASURE_PROPOSALS[0] as unknown as T;
  }

  // create category
  if (/^canhoes\/admin\/categories$/.test(path)) {
    return {
      id: `cat-new-${Date.now()}`,
      name: "Nova Categoria",
      sortOrder: 99,
      isActive: true,
      kind: "Sticker",
    } as unknown as T;
  }

  // create nominee
  if (/^canhoes\/nominees$/.test(path)) {
    return {
      id: `nom-new-${Date.now()}`,
      categoryId: null,
      title: "Nova Nomeação",
      status: "pending",
      createdAtUtc: new Date().toISOString(),
    } as unknown as T;
  }

  // vote
  if (/^canhoes\/vote$/.test(path)) {
    return {
      id: `vote-${Date.now()}`,
      categoryId: "cat-001",
      nomineeId: "nom-001",
      updatedAtUtc: new Date().toISOString(),
    } as unknown as T;
  }

  // state update
  if (/^canhoes\/admin\/state$/.test(path)) {
    return MOCK_STATE as unknown as T;
  }

  // hub post create
  if (/^hub\/posts$/.test(path)) {
    return {
      id: `post-new-${Date.now()}`,
      authorUserId: "mock-admin-001",
      authorName: "Dev Admin",
      text: "Post de mock",
      mediaUrl: null,
      mediaUrls: [],
      isPinned: false,
      likedByMe: false,
      likeCount: 0,
      commentCount: 0,
      reactionCounts: {},
      myReactions: [],
      createdAtUtc: new Date().toISOString(),
      poll: null,
    } as unknown as T;
  }

  // default: empty success
  return undefined as unknown as T;
}

function handleRead<T>(path: string): T {
  // canhoes state
  if (path === "canhoes/state") return MOCK_STATE as unknown as T;

  // categories (public)
  if (path === "canhoes/categories") {
    return MOCK_CATEGORIES.filter((c) => c.isActive) as unknown as T;
  }

  // admin categories
  if (path === "canhoes/admin/categories") return MOCK_CATEGORIES as unknown as T;

  // nominees (public) – handle optional ?categoryId query
  if (path.startsWith("canhoes/nominees")) {
    const url = new URL(`http://x/${path}`);
    const catId = url.searchParams.get("categoryId");
    const approved = MOCK_NOMINEES.filter((n) => n.status === "approved");
    return (catId ? approved.filter((n) => n.categoryId === catId) : approved) as unknown as T;
  }

  // admin nominees
  if (path.startsWith("canhoes/admin/nominees")) {
    const url = new URL(`http://x/${path}`);
    const status = url.searchParams.get("status");
    return (
      status ? MOCK_NOMINEES.filter((n) => n.status === status) : MOCK_NOMINEES
    ) as unknown as T;
  }

  // pending admin
  if (path === "canhoes/admin/pending") return MOCK_PENDING as unknown as T;

  // votes audit
  if (path === "canhoes/admin/votes") return MOCK_VOTES as unknown as T;

  // proposals history
  if (path === "canhoes/admin/proposals")
    return MOCK_PROPOSALS_HISTORY as unknown as T;

  // measure proposals admin
  if (path.startsWith("canhoes/admin/measures/proposals")) {
    const url = new URL(`http://x/${path}`);
    const status = url.searchParams.get("status");
    return (
      status
        ? MOCK_MEASURE_PROPOSALS.filter((p) => p.status === status)
        : MOCK_MEASURE_PROPOSALS
    ) as unknown as T;
  }

  // members
  if (path === "canhoes/members") return MOCK_MEMBERS as unknown as T;

  // my votes
  if (path === "canhoes/my-votes") return [] as unknown as T;
  if (path === "canhoes/my-user-votes") return [] as unknown as T;

  // wishlist
  if (path === "canhoes/wishlist") return [] as unknown as T;

  // measures (public)
  if (path === "canhoes/measures") return [] as unknown as T;

  // results
  if (path === "canhoes/results") return [] as unknown as T;

  // hub posts
  if (path === "hub/posts") return MOCK_HUB_POSTS as unknown as T;

  // hub comments
  if (/^hub\/posts\/.+\/comments$/.test(path)) return [] as unknown as T;

  // /api/me — mock user profile
  if (path === "me") {
    return {
      user: {
        id: "mock-admin-001",
        email: "admin@dev.local",
        displayName: "Dev Admin",
        isAdmin: true,
      },
    } as unknown as T;
  }

  // fallback
  return null as unknown as T;
}
