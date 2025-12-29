// tests/unit/instructions/stake.test.ts
import { BN } from "@project-serum/anchor";

describe("Stake Instruction", () => {
  it("Should stake tokens successfully", async () => {
    // Arrange
    const stakeAmount = new BN(1000 * 10 ** 9); // 1000 tokens
    const [userStatePDA] = await getPDA(user1.publicKey, "user_state");
    
    // Mint tokens para o usuário
    await mintToUser(user1, stakeAmount);
    
    // Act
    const tx = await program.methods
      .stake(stakeAmount)
      .accounts({
        user: user1.publicKey,
        userState: userStatePDA,
        // ... outras contas
      })
      .signers([user1])
      .rpc();
    
    // Assert
    const userState = await program.account.userState.fetch(userStatePDA);
    
    // Verificar se stake foi registrado
    assert.equal(userState.stakedAmount.toString(), stakeAmount.toString());
    assert.isAbove(userState.stakeTimestamp.toNumber(), 0);
    
    // Verificar se tokens foram transferidos para o vault
    const vaultBalance = await stakingToken.getAccountBalance(stakingVault);
    assert.equal(vaultBalance.amount, stakeAmount.toString());
  });
  
  it("Should fail when staking zero tokens", async () => {
    try {
      await program.methods
        .stake(new BN(0))
        .accounts({ /* ... */ })
        .rpc();
      
      assert.fail("Should have thrown error");
    } catch (error) {
      assert.include(error.message, "InvalidStakeAmount");
    }
  });
  
  it("Should fail with insufficient balance", async () => {
    const excessiveAmount = new BN(1000000 * 10 ** 9);
    
    try {
      await program.methods
        .stake(excessiveAmount)
        .accounts({ /* ... */ })
        .rpc();
      
      assert.fail("Should have thrown error");
    } catch (error) {
      assert.include(error.message, "InsufficientBalance");
    }
  });
});