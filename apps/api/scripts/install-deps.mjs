import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const venvDir = path.join(root, ".venv");
const venvPython = path.join(
  venvDir,
  isWindows ? "Scripts" : "bin",
  isWindows ? "python.exe" : "python",
);

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const pythonCandidates = isWindows
  ? ["py", "python"]
  : ["python3.12", "python3", "python"];

function resolveSystemPython() {
  for (const candidate of pythonCandidates) {
    const probe = spawnSync(
      candidate,
      candidate === "py" ? ["-3.12", "--version"] : ["--version"],
      { encoding: "utf8", shell: false },
    );

    if (probe.status === 0) {
      return {
        command: candidate,
        args: candidate === "py" ? ["-3.12"] : [],
      };
    }
  }

  console.error("Python 3.12+ was not found on PATH.");
  process.exit(1);
}

if (!existsSync(venvPython)) {
  const python = resolveSystemPython();
  console.log("Creating virtual environment at apps/api/.venv ...");
  run(python.command, [...python.args, "-m", "venv", venvDir]);
}

console.log("Installing Python dependencies...");
run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"]);
run(venvPython, ["-m", "pip", "install", "-r", "requirements.txt"]);
console.log("API dependencies installed.");
