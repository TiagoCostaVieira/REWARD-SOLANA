// tests/utils/actions.ts
import { program, provider, BN } from './setup';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { VaultProject } from '../../target/types/vault_project';
import { assert } from 'chai';
import * as anchor from '@coral-xyz/anchor';

export async function fundUser(user: Keypair): Promise<void> {
  const sig = await provider.connection.requestAirdrop(
    user.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  
  const latestBlockhash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({
    signature: sig,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  }, "confirmed");
}

/**
 * Initialize globalstate (chamar apenas uma vez)
 */
export async function initializeGlobalState(authority: Keypair): Promise<string> {
  const [globalPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  const tx = await program.methods
    .initialize()
    .accounts({
      globalstate: globalPDA,
      authority: authority.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    } as any) // Bypass TS até build limpo
    .signers([authority])
    .rpc();
  
  return tx;
}

/**
 * Get total rewards from globalstate
 */
export async function getTotalReward(): Promise<number> {
  try {
    const [globalPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId
    );
    
    const state = await program.account.globalState.fetch(globalPDA); // camelCase para account
    return state.totalReward.toNumber();
  } catch (error) {
    console.error("Failed to fetch total reward:", error);
    throw new Error(`Failed to get total reward: ${error}`);
  }
}

/**
 * Update total rewards (exemplo para admin)
 */
export async function updateTotalReward(
  authority: Keypair, 
  amount: number // Mudado para amount (incremental, como Rust)
): Promise<string> {
  const [globalPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  const tx = await program.methods
    .updateTotalReward(new BN(amount))
    .accounts({
      globalstate: globalPDA,
      authority: authority.publicKey,
    } as any)
    .signers([authority])
    .rpc();
  
  return tx;
}

/**
 * Stake tokens (implementação exemplo)
 */
export async function stakeTokens(
  user: Keypair,
  amount: number
): Promise<string> {
  const [userStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_state"), user.publicKey.toBuffer()],
    program.programId
  );

  return await program.methods
    .stake(new BN(amount))
    .accounts({
      userState: userStatePDA,
      user: user.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([user])
    .rpc();
}

/**
 * Unstake tokens (implementação exemplo)
 */
export async function unstakeTokens(
  user: Keypair,
  amount: number
): Promise<string> {
  const [userStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_state"), user.publicKey.toBuffer()],
    program.programId
  );

  return await program.methods
    .unstake(new BN(amount))
    .accounts({
      userState: userStatePDA,
      user: user.publicKey,
    })
    .signers([user])
    .rpc();
}

/**
 * Set reward rate (admin function)
 */
export async function setRewardRate(
  authority: Keypair,
  rate: number
): Promise<string> {
  const [globalPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  return await program.methods
    .setRewardRate(new BN(rate))
    .accounts({
      globalstate: globalPDA,
      authority: authority.publicKey,
    })
    .signers([authority])
    .rpc();
}

/**
 * Setup reward pool
 */
export async function setupRewardPool(
  authority: Keypair,
  initialRewards: number
): Promise<string> {
  const [globalPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  const [vaultPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("reward_vault")],
    program.programId
  );

  return await program.methods
    .setupRewardPool(new BN(initialRewards))
    .accounts({
      globalstate: globalPDA,
      rewardVault: vaultPDA,
      authority: authority.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
      // Adicionar token program quando implementar
    })
    .signers([authority])
    .rpc();
}

/**
 * Claim rewards
 */
export async function claimRewards(user: Keypair): Promise<string> {
  const [userStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_state"), user.publicKey.toBuffer()],
    program.programId
  );

  const [globalPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_state")],
    program.programId
  );

  return await program.methods
    .claimRewards()
    .accounts({
      userState: userStatePDA,
      globalstate: globalPDA,
      user: user.publicKey,
      // Adicione token accounts quando implementar
    })
    .signers([user])
    .rpc();
}

// Export assert para uso nos testes
export { assert } from 'chai';