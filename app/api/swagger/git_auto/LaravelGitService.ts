import { invalidateGetCache } from "../getCache";

const API_ROOT = "/next/api/gitea";
const OWNER = "company_team";
const REPOSITORY = "media_tech_ai";
const COMPONENT = "openclaw";

export type GitApiError = Error & {
  code?: string;
  status?: number;
  uncertain?: boolean;
};
export type SourceInfo = {
  component: string;
  repo_root: string;
  component_path: string;
  branch: string;
  remote: string;
  remote_url: string;
  repository_type: string;
  git_available: boolean;
  source_available: boolean;
};
export type ChangedFile = { path: string; status: string };
export type SourceStatus = {
  component: string;
  branch: string;
  clean: boolean;
  changed_files: number;
  staged: number;
  unstaged: number;
  untracked: number;
  ahead: number;
  behind: number;
  files: ChangedFile[];
};
export type SourceDiff = {
  component: string;
  files: { staged: ChangedFile[]; unstaged: ChangedFile[] };
  diff: string;
};
export type SourceSync = {
  branch?: string;
  remote?: string;
  remote_url?: string;
  remote_available: boolean;
  ahead: number;
  behind: number;
  can_pull: boolean;
  can_commit: boolean;
  can_push: boolean;
  write_enabled: boolean;
  working_tree?: {
    clean: boolean;
    staged: number;
    unstaged: number;
    untracked: number;
  };
  blockers: string[];
};
export type Preflight = {
  operation: "pull" | "commit" | "push";
  target_branch?: string;
  allowed: boolean;
  write_enabled: boolean;
  blockers: string[];
  ahead?: number;
  behind?: number;
};
export type Commit = {
  sha: string;
  short_sha?: string;
  message?: string;
  author?: string;
  created_at?: string;
};
export type GitCapabilities = { [key: string]: boolean };
export type PullRequest = {
  exists: boolean;
  index?: number;
  title?: string;
  description?: string;
  head?: string;
  base?: string;
  state?: string;
  review_state?: string;
  mergeable?: boolean;
};
export type GitWorkflow = {
  repository: string;
  component: string;
  base_branch: string;
  current_branch: string;
  remote: string;
  remote_available: boolean;
  working_tree: {
    clean: boolean;
    staged: number;
    unstaged: number;
    untracked: number;
  };
  sync: { ahead: number; behind: number };
  blockers: string[];
  pull_request: PullRequest;
  permissions: { permission_known: boolean; [key: string]: boolean };
  authenticated_user: { username: string; id?: number; admin?: boolean };
  permission_known: boolean;
  capabilities: GitCapabilities;
};
export type Branch = { name: string; remote?: string; current?: boolean };

function readXsrfCookie() {
  if (typeof document === "undefined") return undefined;
  const value = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("XSRF-TOKEN="))
    ?.slice("XSRF-TOKEN=".length);
  return value ? decodeURIComponent(value) : undefined;
}

async function ensureCsrfSession() {
  if (typeof window === "undefined" || readXsrfCookie()) return;
  await fetch(`${API_ROOT}/health`, {
    cache: "no-store",
    credentials: "include",
    headers: { accept: "application/json" },
  });
}

async function request<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    if (method === "POST") await ensureCsrfSession();
    const xsrfToken = readXsrfCookie();
    response = await fetch(`${API_ROOT}/${path}`, {
      cache: "no-store",
      method,
      credentials: "include",
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(xsrfToken ? { "x-xsrf-token": xsrfToken } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    const error = new Error(
      cause instanceof Error ? cause.message : "Network request failed",
    ) as GitApiError;
    error.uncertain = method === "POST";
    throw error;
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      payload.message || `Git API request failed (${response.status})`,
    ) as GitApiError;
    error.code = payload.error_code || payload.code;
    error.status = response.status;
    error.uncertain =
      method === "POST" && [502, 503, 504].includes(response.status);
    throw error;
  }
  if (method === "POST") {
    invalidateGetCache([
      "workflow",
      "info",
      "status",
      "diff",
      "sync",
      "preflight:pull",
      "preflight:commit",
      "preflight:push",
      "history",
      "branches",
      "tree:*",
      "health",
      "user",
      "repository",
      "commits",
      "registry",
      "progress",
      "gitea:health",
      "gitea:user",
      "gitea:repository",
      "gitea:branches",
      "gitea:commits",
      "gitea:tree*",
      "gitea:registry",
      "gitea:progress",
      "gitea:pull-requests",
    ]);
  }
  return (payload.data ?? payload) as T;
}

export class LaravelGitService {
  async getInfo() {
    return request<SourceInfo>(
      `projects/${OWNER}/${REPOSITORY}/source/info?component=${COMPONENT}`,
    );
  }
  async getWorkflow() {
    return request<GitWorkflow>(
      `projects/${OWNER}/${REPOSITORY}/workflow?component=${COMPONENT}`,
    );
  }
  async getStatus() {
    return request<SourceStatus>(
      `projects/${OWNER}/${REPOSITORY}/source/status?component=${COMPONENT}`,
    );
  }
  async getDiff() {
    return request<SourceDiff>(
      `projects/${OWNER}/${REPOSITORY}/source/diff?component=${COMPONENT}`,
    );
  }
  async getSync(): Promise<SourceSync | null> {
    try {
      return await request<SourceSync>(
        `projects/${OWNER}/${REPOSITORY}/source/sync?component=${COMPONENT}`,
      );
    } catch (error) {
      if ((error as GitApiError).status === 404) return null;
      throw error;
    }
  }
  async getPreflight(operation: Preflight["operation"]) {
    return request<Preflight>(
      `projects/${OWNER}/${REPOSITORY}/source/preflight?component=${COMPONENT}&operation=${operation}`,
    );
  }
  async pull() {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/pull`,
      "POST",
      { component: COMPONENT },
    );
  }
  async commit(message: string) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/commit`,
      "POST",
      { component: COMPONENT, message },
    );
  }
  async push() {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/push`,
      "POST",
      { component: COMPONENT },
    );
  }
  async getHistory() {
    return request<Commit[]>(
      `repositories/${OWNER}/${REPOSITORY}/commits?branch=main&limit=10`,
    );
  }
  async getBranches() {
    return request<Branch[]>(`repositories/${OWNER}/${REPOSITORY}/branches`);
  }
  async fetch() {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/fetch`,
      "POST",
      { component: COMPONENT },
    );
  }
  async updateBase() {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/update-base`,
      "POST",
      { component: COMPONENT },
    );
  }
  async createBranch(name: string) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/create-branch`,
      "POST",
      { component: COMPONENT, branch: name },
    );
  }
  async switchBranch(branch: string) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/switch-branch`,
      "POST",
      { component: COMPONENT, branch },
    );
  }
  async syncBase() {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/sync-base`,
      "POST",
      { component: COMPONENT },
    );
  }
  async stage(files: string[]) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/stage`,
      "POST",
      { component: COMPONENT, files },
    );
  }
  async stageAll() {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/stage-all`,
      "POST",
      { component: COMPONENT },
    );
  }
  async unstage(files: string[]) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/unstage`,
      "POST",
      { component: COMPONENT, files },
    );
  }
  async deleteBranch(branch: string) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/delete-branch`,
      "POST",
      { component: COMPONENT, branch },
    );
  }
  async abortMerge() {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/source/abort-merge`,
      "POST",
      { component: COMPONENT },
    );
  }
  async createPullRequest(
    title: string,
    description: string,
    head: string,
    base: string,
  ) {
    return request<PullRequest>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests`,
      "POST",
      { title, description, head, base },
    );
  }
  async getPullRequests() {
    return request<PullRequest[]>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests`,
    );
  }
  async getPullRequest(index: number) {
    return request<PullRequest>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests/${index}`,
    );
  }
  async requestReview(index: number, reviewers: string[]) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests/${index}/request-review`,
      "POST",
      { reviewers },
    );
  }
  async review(
    index: number,
    action: "approve" | "request_changes",
    body?: string,
  ) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests/${index}/review`,
      "POST",
      { action, body },
    );
  }
  async comment(index: number, body: string) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests/${index}/review`,
      "POST",
      { action: "comment", body },
    );
  }
  async mergePullRequest(index: number) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests/${index}/merge`,
      "POST",
      {},
    );
  }
  async closePullRequest(index: number) {
    return request<unknown>(
      `projects/${OWNER}/${REPOSITORY}/pull-requests/${index}/close`,
      "POST",
      {},
    );
  }
}

export const laravelGitService = new LaravelGitService();
