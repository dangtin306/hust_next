import re

def update_git_auto():
    path = 'app/api/maps/git_auto/GitControl.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix statusColor
    content = re.sub(
        r'const statusColor = \(status\?: string\) =>\s*status === "Clean"\s*\? ".*?"\s*: ".*?";',
        '''const statusColor = (status?: string) =>
  status === "Clean"
    ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/20"
    : "border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/20";''',
        content
    )

    # Clean DiffViewContent
    diff_view_func = '''function DiffViewContent({ content }: { content: string }) {
  const lines = content.split("\\n");
  return (
    <div className="w-full min-w-0 max-w-full max-h-[420px] overflow-x-auto overflow-y-auto rounded-lg border border-slate-800/80 bg-slate-950 p-2.5 font-mono text-[11px] leading-5 text-slate-300 shadow-inner [scrollbar-width:thin]">
      {lines.map((line, idx) => {
        let style = "text-slate-300";
        let bg = "";
        if (line.startsWith("diff --git") || line.startsWith("index ")) {
          style = "text-slate-400 font-semibold";
        } else if (line.startsWith("---")) {
          style = "text-rose-400 font-semibold";
          bg = "bg-rose-950/30";
        } else if (line.startsWith("+++")) {
          style = "text-emerald-400 font-semibold";
          bg = "bg-emerald-950/30";
        } else if (line.startsWith("@@")) {
          style = "text-cyan-300 font-semibold";
          bg = "bg-cyan-950/40";
        } else if (line.startsWith("+")) {
          style = "text-emerald-300";
          bg = "bg-emerald-950/40";
        } else if (line.startsWith("-")) {
          style = "text-rose-300";
          bg = "bg-rose-950/40";
        }
        return (
          <div key={idx} className={`whitespace-pre px-2 py-0.5 rounded-xs select-text ${style} ${bg}`}>
            {line || " "}
          </div>
        );
      })}
    </div>
  );
}'''

    # Ensure DiffViewContent is properly placed before Workflow
    if 'function DiffViewContent' in content:
        content = re.sub(r'function DiffViewContent.*?function Workflow', diff_view_func + '\n\nfunction Workflow', content, flags=re.DOTALL)
    else:
        content = content.replace('function Workflow(', diff_view_func + '\n\nfunction Workflow(')

    # Update GitAutoConfigDemo section and buttons
    content = content.replace(
        '<section className="rounded-xl border border-indigo-100/90 bg-white p-3 shadow-2xs sm:p-4 transition-all duration-200">',
        '<section className="rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_1px_2px_rgba(15,23,42,0.02)] backdrop-blur-xs transition-all duration-200 hover:border-slate-300/80 sm:p-4">'
    )
    content = content.replace(
        '<span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 shadow-2xs">',
        '<span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 shadow-2xs">'
    )
    content = content.replace(
        '<button type="button" onClick={() => void reloadConfig()} disabled={reloading || saving || refreshing} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">',
        '<Button onClick={() => void reloadConfig()} disabled={reloading || saving || refreshing}>'
    )
    content = content.replace(
        '<button type="button" onClick={() => void save()} disabled={saving || reloading || refreshing} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-2xs transition-all duration-150 hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer">',
        '<Button variant="primary" onClick={() => void save()} disabled={saving || reloading || refreshing}>'
    )
    # Closing tags for those buttons if they were </button>
    # Note: <Button> has closing </Button>, check if it replaced correctly

    # Update header in GitControl
    old_header = '''      <header className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-5 py-5 text-white shadow-md">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">'''
    new_header = '''      <header className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white shadow-lg sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-3 lg:flex-row lg:items-center">'''
    if old_header in content:
        content = content.replace(old_header, new_header)

    # Header buttons: Refresh, Reset Workflow, Fetch, Full/Sync
    content = content.replace(
        '<Button onClick={() => load(true, true)} disabled={refreshing}>',
        '<Button variant="dark" onClick={() => load(true, true)} disabled={refreshing}>'
    )
    content = content.replace(
        '<Button\n              onClick={resetWorkflow}\n              disabled={refreshing || Boolean(writeBusy)}\n            >',
        '<Button\n              variant="dark"\n              onClick={resetWorkflow}\n              disabled={refreshing || Boolean(writeBusy)}\n            >'
    )
    content = content.replace(
        '<Button\n                disabled={!can("can_fetch") || Boolean(writeBusy)}\n                onClick={() =>',
        '<Button\n                variant="dark"\n                disabled={!can("can_fetch") || Boolean(writeBusy)}\n                onClick={() =>'
    )
    content = content.replace(
        '<Button\n                disabled={Boolean(writeBusy) || Boolean(loading.update_code)}\n                onClick={() =>',
        '<Button\n                variant="primary"\n                disabled={Boolean(writeBusy) || Boolean(loading.update_code)}\n                onClick={() =>'
    )

    # Sync metrics styling in header
    content = content.replace(
        'className="text-blue-300"\n            description="Số commit đã có trên máy nhưng chưa được đẩy lên Gitea."',
        'className="rounded-md border border-blue-400/20 bg-blue-500/10 px-2 py-0.5 text-blue-300 font-medium"\n            description="Số commit đã có trên máy nhưng chưa được đẩy lên Gitea."'
    )
    content = content.replace(
        'className="text-violet-300"\n            description="Số commit đã có trên máy nhưng chưa được đẩy lên Gitea."',
        'className="rounded-md border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-violet-300 font-medium"\n            description="Số commit đã có trên Gitea nhưng máy bạn chưa cập nhật về."'
    )

    # Update Repository Overview tiles
    old_repo_overview = '''          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Tooltip description="Project Git hiện đang được quản lý và đồng bộ với Gitea.">
                <p className="text-[11px] text-slate-400">Repository</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.authenticated_user.username || "—"} /{" "}
                {workflow?.repository || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Tên project Git đang được quản lý và đồng bộ với Gitea.">
                <p className="text-[11px] text-slate-400">Project</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.repository?.split("/").pop() || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Cho biết folder Git trên máy hiện có sẵn và sử dụng được hay không.">
                <p className="text-[11px] text-slate-400">Local repository</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {info?.source_available ? "Available" : "Unavailable"}
              </p>
            </div>
            <div>
              <Tooltip description="Kiểu tổ chức source code của project. Monorepo nghĩa là nhiều phần của project nằm chung trong một repository.">
                <p className="text-[11px] text-slate-400">Repository type</p>
              </Tooltip>
              <p className="mt-1 truncate text-xs font-semibold">
                {info?.repository_type || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Tài khoản Gitea hiện đang được sử dụng.">
                <p className="text-[11px] text-slate-400">Authenticated user</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.authenticated_user.username || "—"}
              </p>
            </div>
            <div>
              <Tooltip description="Quyền hiện tại của tài khoản đối với repository, ví dụ đọc, ghi, tạo PR hoặc merge.">
                <p className="text-[11px] text-slate-400">Permission</p>
              </Tooltip>
              <p className="mt-1 text-sm font-semibold">
                {workflow?.permission_known ? "Known" : "Unknown"}
              </p>
            </div>
          </div>'''

    new_repo_overview = '''          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50">
              <Tooltip description="Project Git hiện đang được quản lý và đồng bộ với Gitea.">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Repository</p>
              </Tooltip>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                {workflow?.authenticated_user.username || "—"} /{" "}
                {workflow?.repository || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50">
              <Tooltip description="Tên project Git đang được quản lý và đồng bộ với Gitea.">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project</p>
              </Tooltip>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                {workflow?.repository?.split("/").pop() || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50">
              <Tooltip description="Cho biết folder Git trên máy hiện có sẵn và sử dụng được hay không.">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Local repository</p>
              </Tooltip>
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                {info?.source_available ? "Available" : "Unavailable"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50">
              <Tooltip description="Kiểu tổ chức source code của project. Monorepo nghĩa là nhiều phần của project nằm chung trong một repository.">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Repository type</p>
              </Tooltip>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                {info?.repository_type || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50">
              <Tooltip description="Tài khoản Gitea hiện đang được sử dụng.">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Authenticated user</p>
              </Tooltip>
              <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                {workflow?.authenticated_user.username || "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50">
              <Tooltip description="Quyền hiện tại của tài khoản đối với repository, ví dụ đọc, ghi, tạo PR hoặc merge.">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Permission</p>
              </Tooltip>
              <p className="mt-1 text-xs font-semibold text-slate-800">
                {workflow?.permission_known ? "Known" : "Unknown"}
              </p>
            </div>
          </div>'''

    if old_repo_overview in content:
        content = content.replace(old_repo_overview, new_repo_overview)

    # Update primary action buttons
    # Full/Sync in Update (Client)
    content = content.replace(
        '<Button\n                  disabled={Boolean(writeBusy) || Boolean(loading.update_code)}\n                  onClick={() => {\n                    setUpdateNotice("Full/Sync in progress…");',
        '<Button\n                  variant="primary"\n                  disabled={Boolean(writeBusy) || Boolean(loading.update_code)}\n                  onClick={() => {\n                    setUpdateNotice("Full/Sync in progress…");'
    )
    # Commit button in Commit (Client)
    content = content.replace(
        '<Button\n                  disabled={\n                    !commitAllowed ||\n                    !commitMessage.trim() ||\n                    Boolean(writeBusy)\n                  }\n                  onClick={() => void write("commit")}\n                >',
        '<Button\n                  variant="primary"\n                  disabled={\n                    !commitAllowed ||\n                    !commitMessage.trim() ||\n                    Boolean(writeBusy)\n                  }\n                  onClick={() => void write("commit")}\n                >'
    )
    # Push Code button in Push (Client)
    content = content.replace(
        '<Button\n                disabled={!pushAllowed || Boolean(writeBusy)}\n                onClick={() => void write("push", "code")}\n              >',
        '<Button\n                variant="primary"\n                disabled={!pushAllowed || Boolean(writeBusy)}\n                onClick={() => void write("push", "code")}\n              >'
    )
    # Create Pull Request in Pull Request (Client)
    content = content.replace(
        '<Button\n                  disabled={!can("can_create_pr") || Boolean(writeBusy) || pullRequestLoading}\n                  onClick={() => void createPullRequest()}\n                >',
        '<Button\n                  variant="primary"\n                  disabled={!can("can_create_pr") || Boolean(writeBusy) || pullRequestLoading}\n                  onClick={() => void createPullRequest()}\n                >'
    )

    # Diff Viewer: use DiffViewContent
    old_diff_pre = '''            ) : diff?.diff ? (
              <pre className="w-full min-w-0 max-w-full max-h-[420px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-lg border border-slate-800/80 bg-slate-950 p-3 font-mono text-[11px] leading-5 text-slate-300 shadow-inner">
                {diff.diff}
              </pre>
            ) : ('''
    new_diff_pre = '''            ) : diff?.diff ? (
              <DiffViewContent content={diff.diff} />
            ) : ('''
    if old_diff_pre in content:
        content = content.replace(old_diff_pre, new_diff_pre)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('update_git_auto finished successfully')

update_git_auto()
