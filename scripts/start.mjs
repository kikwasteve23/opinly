import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const port = process.env.PORT || "43173";
const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, "start", "--hostname", "0.0.0.0", "--port", String(port)], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
