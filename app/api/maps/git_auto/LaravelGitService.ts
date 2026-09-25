import { invalidateGetCache } from "../getCache";

const API_ROOT = "/next/api/gitea/git_auto";

export type GitAutoConfig = {
  provider: string;
  remote_url: string;
  repository: string;
  component: string;
  local_path: string;
  base_branch: string;
  working_branch: string;
  access_token?: string;
  username?: string;
};

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
export type PushMode = "code" | "packages" | "all";
export type Commit = {
  sha: string;
  short_sha?: string;
  message?: string;
  author?: string;
  created_at?: string;
  date?: string;
  remote_status?: string;
  is_pushed?: boolean;
  push_required?: boolean;
};
export type HistoryEvent =
  | (Commit & { type: "commit" })
  | { type: "pull"; branch?: string; status?: string; date?: string }
  | { type: "push"; mode?: string; status?: string; date?: string }
  | { type: "pull_request"; pr_index?: number; source_branch?: string; target_branch?: string; status?: string; date?: string }
  | { type: "merge"; pr_index?: number; source_branch?: string; target_branch?: string; status?: string; short_sha?: string; date?: string };
export type HistoryResponse = {
  history_data?: HistoryEvent[];
  commits?: Commit[];
  sync?: Record<string, unknown>;
};
export type GitDashboardState = {
  workflow?: GitWorkflow;
  info?: SourceInfo;
  status?: SourceStatus;
  diff?: SourceDiff;
  history?: HistoryResponse | HistoryEvent[];
  preflight?: {
    pull?: Preflight;
    commit?: Preflight;
    push?: Preflight;
  };
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
  await fetch(`${API_ROOT}/projects/edit/config`, {
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
      "git_auto:dashboard-state",
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
  private config?: GitAutoConfig;

  setConfig(config: Partial<GitAutoConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig() {
    return request<GitAutoConfig>("projects/edit/config").then((config) => {
      this.setConfig(config);
      return config;
    });
  }

  async saveConfig(config: GitAutoConfig) {
    const saved = await request<GitAutoConfig>(
      "projects/edit/config",
      "POST",
      config,
    );
    this.setConfig(saved);
    return saved;
  }

  private selectProjectPath() {
    return "projects";
  }

  private componentName() {
    if (!this.config?.component) throw new Error("Git config chưa được tải");
    return this.config.component;
  }

  private baseBranch() {
    if (!this.config?.base_branch) throw new Error("Git config chưa được tải");
    return this.config.base_branch;
  }

  private workingBranch() {
    if (!this.config?.working_branch) throw new Error("Git config chưa được tải");
    return this.config.working_branch;
  }

  async getInfo() {
    return request<SourceInfo>(
      `${this.selectProjectPath()}/source/info?component=${this.componentName()}`,
    );
  }
  async getDashboardState(sections?: string[]) {
    const query = new URLSearchParams({ component: this.componentName() });
    if (sections?.length) query.set("sections", sections.join(","));
    return request<GitDashboardState>(
      `${this.selectProjectPath()}/source/dashboard-state?${query.toString()}`,
    );
  }
  async getWorkflow() {
    return request<GitWorkflow>(
      `${this.selectProjectPath()}/source/workflow?component=${this.componentName()}`,
    );
  }
  async getStatus() {
    return request<SourceStatus>(
      `${this.selectProjectPath()}/source/status?component=${this.componentName()}`,
    );
  }
  async getDiff() {
    return request<SourceDiff>(
      `${this.selectProjectPath()}/source/diff?component=${this.componentName()}`,
    );
  }
  async getSync(): Promise<SourceSync | null> {
    try {
      return await request<SourceSync>(
        `${this.selectProjectPath()}/source/sync?component=${this.componentName()}`,
      );
    } catch (error) {
      if ((error as GitApiError).status === 404) return null;
      throw error;
    }
  }
  async getPreflight(operation: Preflight["operation"]) {
    return request<Preflight>(
      `${this.selectProjectPath()}/source/preflight?component=${this.componentName()}&operation=${operation}`,
    );
  }
  async pull() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/pull`,
      "POST",
      { component: this.componentName() },
    );
  }
  async commit(message: string) {
    return request<unknown>(
      `${this.selectProjectPath()}/source/commit`,
      "POST",
      { component: this.componentName(), message },
    );
  }
  async uncommit() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/uncommit`,
      "POST",
      { component: "all" },
    );
  }
  async push(mode: PushMode = "code") {
    return request<unknown>(
      `${this.selectProjectPath()}/source/push`,
      "POST",
      { component: this.componentName(), mode },
    );
  }
  async getHistory() {
    return request<HistoryResponse>(
      `${this.selectProjectPath()}/source/history?component=${this.componentName()}&limit=10`,
    );
  }
  async getBranches() {
    return request<Branch[]>("repositories/branches");
  }
  async fetch() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/fetch`,
      "POST",
      { component: this.componentName() },
    );
  }
  async updateBase() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/update-base`,
      "POST",
      { component: this.componentName() },
    );
  }
  async updateCode() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/update-code`,
      "POST",
      { component: this.componentName() },
    );
  }
  async createBranch(name: string) {
    return request<unknown>(
      `${this.selectProjectPath()}/source/create-branch`,
      "POST",
      { component: this.componentName(), branch: name },
    );
  }
  async switchBranch(branch: string) {
    return request<unknown>(
      `${this.selectProjectPath()}/source/switch-branch`,
      "POST",
      { component: this.componentName(), branch },
    );
  }
  async syncBase() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/sync-base`,
      "POST",
      { component: this.componentName() },
    );
  }
  async stage(files: string[]) {
    return request<unknown>(
      `${this.selectProjectPath()}/source/stage`,
      "POST",
      { component: this.componentName(), files },
    );
  }
  async stageAll() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/stage-all`,
      "POST",
      { component: this.componentName() },
    );
  }
  async unstage(files: string[]) {
    return request<unknown>(
      `${this.selectProjectPath()}/source/unstage`,
      "POST",
      { component: this.componentName(), files },
    );
  }
  async deleteBranch(branch: string) {
    return request<unknown>(
      `${this.selectProjectPath()}/source/delete-branch`,
      "POST",
      { component: this.componentName(), branch },
    );
  }
  async abortMerge() {
    return request<unknown>(
      `${this.selectProjectPath()}/source/abort-merge`,
      "POST",
      { component: this.componentName() },
    );
  }
  async createPullRequest(
    title: string,
    description: string,
  ) {
    return request<PullRequest>(
      "projects/pull-requests",
      "POST",
      { title, description, head: this.workingBranch(), base: this.baseBranch() },
    );
  }
  async getPullRequests() {
    return request<PullRequest[]>(
      "projects/pull-requests",
    );
  }
  async getPullRequest(index: number) {
    return request<PullRequest>(
      `projects/pull-requests/${index}`,
    );
  }
  async requestReview(index: number, reviewers: string[]) {
    return request<unknown>(
      `projects/pull-requests/${index}/request-review`,
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
      `projects/pull-requests/${index}/review`,
      "POST",
      { action, body },
    );
  }
  async comment(index: number, body: string) {
    return request<unknown>(
      `projects/pull-requests/${index}/review`,
      "POST",
      { action: "comment", body },
    );
  }
  async mergePullRequest(index: number) {
    return request<unknown>(
      `projects/pull-requests/${index}/merge`,
      "POST",
      {},
    );
  }
  async closePullRequest(index: number) {
    return request<unknown>(
      `projects/pull-requests/${index}/close`,
      "POST",
      {},
    );
  }
}

export const laravelGitService = new LaravelGitService();
