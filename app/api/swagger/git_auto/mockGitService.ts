export type GitStatus = "clean" | "modified" | "ahead" | "behind" | "conflict";
export type FileState = "M" | "A" | "D" | "U";
export type ChangeFile = { id: string; name: string; path: string; state: FileState; selected: boolean };
export type Branch = { name: string; current?: boolean; remote?: string };
export type Commit = { hash: string; message: string; author: string; date: string; ref: string; parent: string; files: string[] };
export type GitSnapshot = {
  repositoryPath: string;
  remote: string;
  currentBranch: string;
  status: GitStatus;
  ahead: number;
  behind: number;
  staged: ChangeFile[];
  changes: ChangeFile[];
  untracked: ChangeFile[];
  branches: Branch[];
  history: Commit[];
  selectedFileId: string;
};

const file = (id: string, name: string, path: string, state: FileState): ChangeFile => ({ id, name, path, state, selected: false });

export const initialGitSnapshot: GitSnapshot = {
  repositoryPath: "/workspace/media_tech_ai",
  remote: "origin  http://vip.tecom.pro:8806/dangtin/media_tech_ai.git",
  currentBranch: "main",
  status: "modified",
  ahead: 2,
  behind: 1,
  staged: [file("staged-1", "app.ts", "src/app.ts", "M"), file("staged-2", "route.ts", "server/routes/route.ts", "A")],
  changes: [file("change-1", "page.tsx", "src/pages/page.tsx", "M"), file("change-2", "layout.tsx", "src/layout.tsx", "M"), file("change-3", "styles.css", "src/styles/styles.css", "M"), file("change-4", "config.ts", "src/config/config.ts", "D")],
  untracked: [file("untracked-1", "gitService.ts", "src/services/gitService.ts", "U")],
  branches: [{ name: "main", current: true, remote: "origin/main" }, { name: "develop", remote: "origin/develop" }, { name: "feature/git-control", remote: "origin/feature/git-control" }],
  selectedFileId: "staged-1",
  history: [
    { hash: "82f6e57", message: "Update OpenClaw compose", author: "dangtin306", date: "2 hours ago", ref: "main", parent: "2421aa5", files: ["docker-compose.yml", "README.md"] },
    { hash: "2421aa5", message: "Add Gitea project status dashboard", author: "dangtin306", date: "yesterday", ref: "main", parent: "778296d", files: ["app/api/swagger/gitea_test/page.tsx"] },
    { hash: "778296d", message: "Tune API gateway configuration", author: "dangtin306", date: "2 days ago", ref: "main", parent: "31b1a20", files: ["config/gateway.ts"] },
    { hash: "31b1a20", message: "Refactor media service routes", author: "dangtin306", date: "3 days ago", ref: "main", parent: "98aa102", files: ["server/routes/media.ts"] },
    { hash: "98aa102", message: "Add image generation service", author: "minhnguyen", date: "5 days ago", ref: "main", parent: "a12bc90", files: ["services/image.ts", "types/media.ts"] },
    { hash: "a12bc90", message: "Improve error boundaries", author: "minhnguyen", date: "1 week ago", ref: "develop", parent: "c45de11", files: ["components/ErrorBoundary.tsx"] },
    { hash: "c45de11", message: "Update developer documentation", author: "dangtin306", date: "1 week ago", ref: "develop", parent: "0d22ef1", files: ["CONTRIBUTING.md"] },
    { hash: "0d22ef1", message: "Initial project structure", author: "dangtin306", date: "2 weeks ago", ref: "main", parent: "0000000", files: ["package.json", "README.md"] },
  ],
};

export class MockGitService {
  private snapshot: GitSnapshot = structuredClone(initialGitSnapshot);

  async status() { return structuredClone(this.snapshot); }
  async fetch() { return this.snapshot; }
  async pull() { return this.snapshot; }
  async push() { return this.snapshot; }
  async sync() { return this.snapshot; }
  async checkout(branch: string) { this.snapshot.currentBranch = branch; this.snapshot.branches = this.snapshot.branches.map((item) => ({ ...item, current: item.name === branch })); return this.status(); }
  async stage(ids: string[]) { const selected = this.snapshot.changes.concat(this.snapshot.untracked).filter((item) => ids.includes(item.id)); this.snapshot.staged.push(...selected.map((item) => ({ ...item, selected: false }))); this.snapshot.changes = this.snapshot.changes.filter((item) => !ids.includes(item.id)); this.snapshot.untracked = this.snapshot.untracked.filter((item) => !ids.includes(item.id)); return this.status(); }
  async unstage(ids: string[]) { const selected = this.snapshot.staged.filter((item) => ids.includes(item.id)); this.snapshot.changes.push(...selected.map((item) => ({ ...item, selected: false }))); this.snapshot.staged = this.snapshot.staged.filter((item) => !ids.includes(item.id)); return this.status(); }
  async discard(ids: string[]) { this.snapshot.changes = this.snapshot.changes.filter((item) => !ids.includes(item.id)); this.snapshot.untracked = this.snapshot.untracked.filter((item) => !ids.includes(item.id)); return this.status(); }
  async commit(message: string) { this.snapshot.history.unshift({ hash: "new1234", message, author: "you", date: "just now", ref: this.snapshot.currentBranch, parent: this.snapshot.history[0]?.hash || "0000000", files: this.snapshot.staged.map((item) => item.path) }); this.snapshot.staged = []; return this.status(); }
  async getHistory() { return structuredClone(this.snapshot.history); }
  async mockAction() { return this.status(); }
}
