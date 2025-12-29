// app/src/utils/program.ts
import { Program, AnchorProvider } from "@project-serum/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { IDL, StakingRewards } from "./idl/staking_rewards";

export class StakingClient {
    private program: Program<StakingRewards>;
    private connection: Connection;
    
    constructor(provider: AnchorProvider, programId: PublicKey) {
        this.program = new Program(IDL, programId, provider);
        this.connection = provider.connection;
    }
    
    async stake(amount: number, user: Keypair) {
        // 1. Preparar contas
        const [userStatePDA] = await this.findUserStatePDA(user.publicKey);
        const [vaultPDA] = await PublicKey.findProgramAddress(
            [Buffer.from("vault")],
            this.program.programId
        );
        
        // 2. Chamar instrução de stake
        const tx = await this.program.methods
            .stake(new BN(amount * 10 ** 9)) // Converter para lamports
            .accounts({
                user: user.publicKey,
                userState: userStatePDA,
                programVault: vaultPDA,
                // ... outras contas
            })
            .signers([user])
            .rpc();
        
        return tx;
    }
    
    async claimRewards(user: Keypair) {
        // Claim SEPARADO - não mexe no stake
        const tx = await this.program.methods
            .claimRewards()
            .accounts({
                user: user.publicKey,
                // ... contas de recompensa separadas
            })
            .signers([user])
            .rpc();
        
        return tx;
    }
    
    async getUserInfo(user: PublicKey) {
        const [userStatePDA] = await this.findUserStatePDA(user);
        
        return {
            stakedAmount: await this.getStakedAmount(userStatePDA),
            pendingRewards: await this.getPendingRewards(userStatePDA),
            timeStaked: await this.getTimeStaked(userStatePDA),
            apy: await this.calculateCurrentAPY(),
            canUnstake: await this.canUnstake(userStatePDA),
        };
    }
}