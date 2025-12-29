// tests/unit/state/calculations.test.ts
describe("Rewards Calculations", () => {
  it("Should calculate rewards deterministically", async () => {
    // Configurar APY fixo de 10%
    await setRewardRate(10); // 10% APY
    
    // 1. User1 staking 1000 tokens
    await stakeTokens(user1, 1000);
    
    // 2. Avançar 1 ano exatamente
    await advanceTime(365 * 24 * 60 * 60);
    
    // 3. Calcular recompensas
    const rewards = await calculatePendingRewards(user1);
    
    // 4. Verificar cálculo determinístico
    const expectedRewards = 1000 * 0.10; // 10% de 1000
    assert.equal(rewards, expectedRewards);
    
    // 5. Avançar mais 6 meses
    await advanceTime(182 * 24 * 60 * 60);
    
    // 6. Recalcular (deve ser consistente)
    const rewardsAfter6Months = await calculatePendingRewards(user1);
    const expectedAfter6Months = 1000 * 0.05; // 5% adicional
    assert.equal(rewardsAfter6Months - rewards, expectedAfter6Months);
  });
  
  it("Should handle multiple users proportionally", async () => {
    // Configurar pool de 1000 tokens/ano de recompensa
    await setupRewardPool(1000);
    
    // User1 staking 75% do total
    await stakeTokens(user1, 750);
    
    // User2 staking 25% do total
    await stakeTokens(user2, 250);
    
    // Avançar 6 meses
    await advanceTime(182 * 24 * 60 * 60);
    
    // Recompensas devem ser proporcionais
    const rewards1 = await calculatePendingRewards(user1);
    const rewards2 = await calculatePendingRewards(user2);
    
    // 500 tokens totais em 6 meses (metade do ano)
    // User1: 75% de 500 = 375
    // User2: 25% de 500 = 125
    assert.equal(rewards1, 375);
    assert.equal(rewards2, 125);
  });
});