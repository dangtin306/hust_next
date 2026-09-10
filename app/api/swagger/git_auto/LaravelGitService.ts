const API_ROOT = "/next/api/gitea";
const OWNER = "dangtin";
const REPOSITORY = "media_tech_ai";
const COMPONENT = "openclaw";

export type GitApiError = Error & { code?: string; status?: number };
export type SourceInfo = { component: string; repo_root: string; component_path: string; branch: string; remote: string; remote_url: string; repository_type: string; git_available: boolean; source_available: boolean };
export type ChangedFile = { path: string; status: string };
export type SourceStatus = { component: string; branch: string; clean: boolean; changed_files: number; staged: number; unstaged: number; untracked: number; ahead: number; behind: number; files: ChangedFile[] };
export type SourceDiff = { component: string; files: { staged: ChangedFile[]; unstaged: ChangedFile[] }; diff: string };
export type SourceSync = { remote_available: boolean; ahead: number; behind: number; can_pull: boolean; can_commit: boolean; can_push: boolean; blockers: string[] };
export type Commit = { sha: string; short_sha?: string; message?: string; author?: string; created_at?: string };

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_ROOT}/${path}`, { cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Git API request failed (${response.status}`) as GitApiError;
    error.code = payload.error_code || payload.code;
    error.status = response.status;
    throw error;
  }
  return (payload.data ?? payload) as T;
}

export class LaravelGitService {
  async getInfo() { return get<SourceInfo>(`projects/${OWNER}/${REPOSITORY}/source/info?component=${COMPONENT}`); }
  async getStatus() { return get<SourceStatus>(`projects/${OWNER}/${REPOSITORY}/source/status?component=${COMPONENT}`); }
  async getDiff() { return get<SourceDiff>(`projects/${OWNER}/${REPOSITORY}/source/diff?component=${COMPONENT}`); }
  async getSync(): Promise<SourceSync | null> {
    try { return await get<SourceSync>(`projects/${OWNER}/${REPOSITORY}/source/sync?component=${COMPONENT}`); }
    catch (error) { if ((error as GitApiError).status === 404) return null; throw error; }
  }
  async getHistory() { return get<Commit[]>(`repositories/${OWNER}/${REPOSITORY}/commits?branch=main&limit=10`); }
}

export const laravelGitService = new LaravelGitService();
