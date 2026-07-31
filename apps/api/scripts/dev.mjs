import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const venvPython = path.join(
  root,
  ".venv",
  isWindows ? "Scripts" : "bin",
  isWindows ? "python.exe" : "python",
);

if (!existsSync(venvPython)) {
  console.error(
    "Virtual environment not found. Run `pnpm install:all` from the repository root first.",
  );
  process.exit(1);
}

const child = spawn(
  venvPython,
  ["-m", "uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
  {
    cwd: root,
    stdio: "inherit",
    shell: false,
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
