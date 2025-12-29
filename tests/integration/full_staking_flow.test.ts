// tests/integration/full_staking_flow.test.ts
describe("Complete Staking Flow", () => {
  it("Should complete full staking lifecycle", async () => {
    console.log("🚀 Starting full staking lifecycle test");
    
    // FASE 1: Initial Stake
    console.log("1. Initial stake...");
    const initialStake = 5000;
    await stakeTokens(user1, initialStake);
    
    let userState = await getUserState(user1);
    assert.equal(userState.stakedAmount, initialStake);
    console.log(`✓ Staked ${initialStake} tokens`);
    
    // FASE 2: Accumulate Rewards
    console.log("2. Accumulating rewards for 90 days...");
    await advanceTime(90 * 24 * 60 * 60);
    
    const rewardsAfter90Days = await getPendingRewards(user1);
    assert.isAbove(rewardsAfter90Days, 0);
    console.log(`✓ Accumulated ${rewardsAfter90Days} rewards`);
    
    // FASE 3: Claim Rewards (separado)
    console.log("3. Claiming rewards (without unstaking)...");
    const balanceBeforeClaim = await getWalletBalance(user1);
    await claimRewards(user1);
    
    // Stake deve permanecer igual
    userState = await getUserState(user1);
    assert.equal(userState.stakedAmount, initialStake);
    console.log("✓ Stake remains intact after claim");
    
    // FASE 4: Additional Stake
    console.log("4. Adding more stake...");
    await stakeTokens(user1, 2000);
    
    userState = await getUserState(user1);
    assert.equal(userState.stakedAmount, initialStake + 2000);
    console.log("✓ Successfully added more stake");
    
    // FASE 5: Partial Unstake após lock
    console.log("5. Partial unstake after lock period...");
    await advanceTime(30 * 24 * 60 * 60); // Total 120 dias
    
    await unstakeTokens(user1, 3000);
    
    userState = await getUserState(user1);
    assert.equal(userState.stakedAmount, initialStake + 2000 - 3000);
    console.log("✓ Partial unstake successful");
    
    // FASE 6: Final Claim e Exit
    console.log("6. Final claim and exit...");
    await advanceTime(7 * 24 * 60 * 60);
    
    await claimRewards(user1);
    await unstakeAll(user1);
    
    userState = await getUserState(user1);
    assert.equal(userState.stakedAmount, 0);
    console.log("✓ Successfully exited staking program");
    
    console.log("🎉 All tests passed!");
  });
});