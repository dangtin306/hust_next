"use strict";

const { spawn } = require("child_process");

process.env.NEXT_PUBLIC_HIDE_DEV_INDICATOR = "1";

const child = spawn("next", ["dev", "--webpack", "-p", "3001"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
