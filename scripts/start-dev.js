"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR = "1";

const uriConfigPath = path.resolve(__dirname, "../src/uri_config.json");
const nextCommand = process.platform === "win32" ? "next.cmd" : "next";
let child;
let restartTimer;
let shuttingDown = false;

const startNext = () => {
  child = spawn(nextCommand, ["dev", "--webpack", "-p", "3001"], {
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

const shutdown = () => {
  shuttingDown = true;
  fs.unwatchFile(uriConfigPath);
  if (restartTimer) clearTimeout(restartTimer);
  if (child) child.kill();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

startNext();
