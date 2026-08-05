"use strict";

const { spawn } = require("child_process");

const isWindows = process.platform === "win32";

process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR = "1";

const args = isWindows
  ? ["start", "-p", "3001"]
  : ["dev", "--webpack", "-p", "3001"];

const child = spawn("next", args, {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
