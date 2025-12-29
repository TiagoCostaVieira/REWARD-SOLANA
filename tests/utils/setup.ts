// tests/utils/setup.ts
import * as anchor from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

export async function initializeWithRealTokens() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.YourProgramName as anchor.Program;

  await program.methods
    .initialize()
    .accounts({
      payer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  const user = Keypair.generate();
    
  console.log("✅ Programa inicializado com tokens reais");
}
