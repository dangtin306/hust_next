const API_ROOT = "/next/api/gitea/gitea_test";

export type ApiResult<T> = { status: string; data: T; message?: string };
export type Health = { connected: boolean; version?: string };
export type User = { username: string; full_name?: string; is_admin?: boolean };
export type Repository = {
  owner: string; name: string; full_name: string; description?: string; private?: boolean;
  language?: string; size: number; default_branch: string; branch_count: number;
  open_issues_count: number; open_pull_requests: number; created_at?: string; updated_at?: string;
};
export type Branch = { name: string; protected?: boolean; latest_commit?: { sha: string; message: string; author: string; timestamp: string } };
export type Commit = { sha: string; message?: string; author?: string; created_at?: string; timestamp?: string };
export type TreeEntry = { name: string; path?: string; type?: string; mode?: string; size?: number };
type TreeResponse = { ref?: string; path?: string; items?: TreeEntry[] };
export type DashboardItem = {
  name: string;
  path?: string;
  type?: string;
  category?: string;
  status?: string;
  tag?: string;
  size?: number | null;
  created_at?: string;
  updated_at?: string | null;
  registry_uri?: string;
  url?: string;
  sha?: string;
  last_commit_sha?: string;
};
export type DashboardGroup = {
  name: string;
  category: "code" | "package" | "deploy" | string;
  items: DashboardItem[];
};
export type Dashboard = { status: string; ref: string; path: string; data: DashboardGroup[] };

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_ROOT}/${path}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`);
  return (payload.data ?? payload) as T;
}

export const getGiteaHealth = () => get<Health>("health");
export const getGiteaUser = () => get<User>("user");
export const getDashboard = async (): Promise<Dashboard> => {
  const response = await fetch(
    `${API_ROOT}/repositories/dashboard`,
    { cache: "no-store" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload as Dashboard;
};
export const getRepository = () => get<Repository>("repositories");
export const getBranches = () => get<Branch[]>("repositories/branches");
export const getCommits = (branch: string, limit = 10) => get<Commit[]>(`repositories/commits?branch=${encodeURIComponent(branch)}&limit=${limit}`);
export const getTree = async (ref: string, path = "") => {
  const result = await get<TreeResponse | TreeEntry[]>(`repositories/tree?ref=${encodeURIComponent(ref)}${path ? `&path=${encodeURIComponent(path)}` : ""}`);
  return Array.isArray(result) ? result : result.items || [];
};
