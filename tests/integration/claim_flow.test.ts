// tests/integration/claim_flow.test.ts
describe("Claim Rewards Flow", () => {
  it("Should claim rewards without affecting stake", async () => {
    // 1. Setup inicial
    await stakeTokens(user1, 1000);
    await advanceTime(30 * 24 * 60 * 60); // 30 dias
    
    // 2. Registrar saldos antes do claim
    const stakedBefore = await getStakedAmount(user1);
    const rewardsBefore = await getPendingRewards(user1);
    const walletBalanceBefore = await getUserTokenBalance(user1, rewardTokenMint);
    
    // 3. Executar claim
    await claimRewards(user1);
    
    // 4. Verificar que stake NÃO mudou
    const stakedAfter = await getStakedAmount(user1);
    assert.equal(stakedAfter, stakedBefore, "Stake amount should not change");
    
    // 5. Verificar que recompensas foram transferidas
    const walletBalanceAfter = await getUserTokenBalance(user1, rewardTokenMint);
    assert.equal(
      walletBalanceAfter - walletBalanceBefore,
      rewardsBefore,
      "Rewards should be transferred to wallet"
    );
    
    // 6. Verificar que pending rewards zerou
    const rewardsAfter = await getPendingRewards(user1);
    assert.equal(rewardsAfter, 0, "Pending rewards should reset to zero");
  });
  
  it("Should allow partial claim", async () => {
    // Gerar muitas recompensas
    await stakeTokens(user1, 10000);
    await advanceTime(365 * 24 * 60 * 60);
    
    // Claim apenas 50%
    const totalRewards = await getPendingRewards(user1);
    await claimPartialRewards(user1, totalRewards / 2);
    
    // Metade deve permanecer pendente
    const remainingRewards = await getPendingRewards(user1);
    assert.approximately(remainingRewards, totalRewards / 2, 0.01);
  });
});