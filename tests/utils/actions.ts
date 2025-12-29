// tests/utils/actions.ts
import * as anchor from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";


const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.YourProgramName as anchor.Program;

/**
 * Envia SOL para o usuário (airdrop)
 */
export async function fundUser(user: Keypair) {
  const sig = await provider.connection.requestAirdrop(
    user.publicKey,
    2 * LAMPORTS_PER_SOL
  );
  await provider.connection.confirmTransaction(sig);
}

/**
 * Faz stake de tokens
 */
export async function stakeTokens(user: Keypair, amount: number) {
  await program.methods
    .stake(new anchor.BN(amount))
    .accounts({
      user: user.publicKey,
      // outras contas do seu programa
    })
    .signers([user])
    .rpc();
}

/**
 * Claim de rewards
 */
export async function claimRewards(user: Keypair) {
  await program.methods
    .claimRewards()
    .accounts({
      user: user.publicKey,
      // outras contas
    })
    .signers([user])
    .rpc();
}

/**
 * Busca o total staked global
 */
export async function getTotalStaked(): Promise<number> {
  const state = await program.account.globalState.fetch(/* pubkey */);
  return state.totalStaked.toNumber();
}
