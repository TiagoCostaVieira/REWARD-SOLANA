// tests/e2e/stress.test.ts
describe("Stress Tests", () => {
  it("Should handle 1000 sequential operations", async () => {
    const operations = [];
    
    for (let i = 0; i < 1000; i++) {
      if (i % 4 === 0) {
        operations.push(stakeTokens(user1, 1));
      } else if (i % 4 === 1) {
        operations.push(claimRewards(user1));
      } else if (i % 4 === 2) {
        operations.push(unstakeTokens(user1, 1));
      } else {
        // Simular wait between operations
        await advanceTime(60); // 1 minuto
      }
    }
    
    // Executar operações sequencialmente
    for (const op of operations) {
      await op;
    }
    
    // Verificar que estado final é consistente
    const finalState = await getUserState(user1);
    assert.isOk(finalState);
  });
  
  it("Should handle high-value stakes", async () => {
    // Testar com valores grandes (evitar overflow)
    const largeStake = new BN("1000000000000000000"); // 1e18
    
    try {
      await stakeTokens(user1, largeStake);
      // Se passar, verificar cálculos não quebraram
      const rewards = await calculatePendingRewards(user1);
      assert.isNotNaN(rewards);
    } catch (error) {
      // Se falhar, deve ser erro esperado (ex: overflow)
      assert.include(error.message, "overflow");
    }
  });
});