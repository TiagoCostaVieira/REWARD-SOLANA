// tests/utils/helpers.ts
import { Keypair } from "@solana/web3.js";
export { Keypair };
export function createTestUser(): Keypair {
  return Keypair.generate();
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function toLamports(sol: number): number {
  return sol * 1_000_000_000;
}

export function fromLamports(lamports: number): number {
  return lamports / 1_000_000_000;
}