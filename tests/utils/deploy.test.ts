// tests/utils/deploy.ts
import { exec } from "child_process";

export async function deployProgram(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("🚀 Deploying Anchor program to localnet...");

    const child = exec(
      "anchor deploy",
      { env: { ...process.env, ANCHOR_PROVIDER_URL: "http://127.0.0.1:8899" } },
      (error, stdout, stderr) => {
        if (error) {
          console.error(stderr);
          reject(error);
          return;
        }

        console.log(stdout);
        console.log("✅ Program deployed successfully");
        resolve();
      }
    );

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}
