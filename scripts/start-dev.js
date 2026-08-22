"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR = "1";

const uriConfigPath = path.resolve(__dirname, "../src/uri_config.json");
const nextCommand = process.platform === "win32" ? "next.cmd" : "next";
const watchedDirectories = [
  path.resolve(__dirname, "../app"),
  path.resolve(__dirname, "../src"),
  path.resolve(__dirname, "../public"),
  path.resolve(__dirname, "../../react_app/src"),
];
let child;
let restartTimer;
let shuttingDown = false;
const directoryWatchers = [];
let changeLogTimer;
const pendingChanges = new Set();

const startNext = () => {
  child = spawn(nextCommand, ["dev", "--webpack", "-p", "3003"], {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    child = undefined;
    if (!shuttingDown && signal === null && code !== 0) {
      process.exit(code ?? 1);
    }
  });
};

const restartNext = () => {
  if (restartTimer || shuttingDown) return;

  restartTimer = setTimeout(() => {
    restartTimer = undefined;
    if (!child) {
      startNext();
      return;
    }

    child.once("exit", startNext);
    child.kill();
  }, 150);
};

fs.watchFile(uriConfigPath, { interval: 300 }, (current, previous) => {
  if (current.mtimeMs !== previous.mtimeMs) restartNext();
});

const logSourceChange = (directory, filename) => {
  const relativePath = filename
    ? path.relative(path.resolve(__dirname, ".."), path.join(directory, filename))
    : path.relative(path.resolve(__dirname, ".."), directory);
  pendingChanges.add(relativePath || filename || directory);

  if (changeLogTimer) return;
  changeLogTimer = setTimeout(() => {
    console.log(`[dev] Fast Refresh detected change: ${Array.from(pendingChanges).join(", ")}`);
    pendingChanges.clear();
    changeLogTimer = undefined;
  }, 100);
};

for (const directory of watchedDirectories) {
  try {
    const watcher = fs.watch(directory, { recursive: true }, (_eventType, filename) => {
      logSourceChange(directory, filename ? String(filename) : "");
    });
    directoryWatchers.push(watcher);
  } catch {
    // Recursive watching is supported on macOS and Windows. Next still
    // watches files normally if the platform does not support this fallback.
  }
}

const shutdown = () => {
  shuttingDown = true;
  fs.unwatchFile(uriConfigPath);
  for (const watcher of directoryWatchers) watcher.close();
  if (changeLogTimer) clearTimeout(changeLogTimer);
  if (restartTimer) clearTimeout(restartTimer);
  if (child) child.kill();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

startNext();
