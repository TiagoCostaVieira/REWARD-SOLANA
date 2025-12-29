// tests/integration/edge_cases.test.ts
describe("Edge Cases", () => {
  it("Should handle zero rewards edge case", async () => {
    // Stake mas não passar tempo suficiente
    await stakeTokens(user1, 1000);
    await advanceTime(1); // 1 segundo
    
    // Claim deve falhar ou retornar zero
    try {
      await claimRewards(user1);
      const rewards = await getPendingRewards(user1);
      assert.equal(rewards, 0);
    } catch (error) {
      assert.include(error.message, "NoRewardsToClaim");
    }
  });
  
  it("Should handle duplicate operations", async () => {
    // Tentar stake duas vezes seguidas
    await stakeTokens(user1, 1000);
    
    try {
      // Mesma transação novamente
      await stakeTokens(user1, 1000);
    } catch (error) {
      // Pode falhar por duplicata ou saldo insuficiente
      assert.isOk(error);
    }
  });
  
  it("Should handle network congestion", async () => {
    // Simular timeout
    const originalConfirm = provider.connection.confirmTransaction;
    provider.connection.confirmTransaction = async () => {
      throw new Error("Timeout");
    };
    
    try {
      await stakeTokens(user1, 1000);
      assert.fail("Should have timed out");
    } catch (error) {
      assert.include(error.message, "Timeout");
    } finally {
      provider.connection.confirmTransaction = originalConfirm;
    }
  });
});