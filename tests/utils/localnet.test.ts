import { spawn, ChildProcess } from "child_process";

let solanaProcess: ChildProcess | null = null;

export async function startLocalnet() {
  solanaProcess = spawn("solana-test-validator", [
    "--reset",
    "--quiet",
  ]);

  // Aguarda o validator subir
  await new Promise((resolve) => setTimeout(resolve, 3000));
}

export async function stopLocalnet() {
  if (solanaProcess) {
    solanaProcess.kill("SIGINT");
    solanaProcess = null;
  }
}
