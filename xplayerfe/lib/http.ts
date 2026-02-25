import axios from "axios";

// Proxy-only: all requests go through Next.js /api, avoiding CORS in dev.
export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Client-side: attach Authorization Bearer <id_token> if available
async function getIdToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const cached = sessionStorage.getItem("idToken");
    if (cached) return cached;
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const id = data?.idToken || null;
    if (id) sessionStorage.setItem("idToken", id);
    return id;
  } catch { return null; }
}

http.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const id = await getIdToken();
    if (id) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${id}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (r) => r,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      sessionStorage.removeItem("me");
      sessionStorage.removeItem("idToken");
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);