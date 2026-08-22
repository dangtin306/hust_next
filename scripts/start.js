"use strict";

const path = require("path");
const { spawn } = require("child_process");

const isWindows = process.platform === "win32";

process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR = "1";

const command = isWindows ? "next" : process.execPath;
const args = isWindows
  ? ["start", "-p", "3003"]
  : [path.resolve(__dirname, "start-dev.js")];

const child = spawn(command, args, {
  stdio: "inherit",
  shell: isWindows,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
