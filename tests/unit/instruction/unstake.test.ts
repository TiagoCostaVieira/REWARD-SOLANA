// tests/unit/instructions/unstake.test.ts
describe("Unstake Instruction", () => {
  it("Should not allow unstake during lock period", async () => {
    // 1. Fazer stake
    await stakeTokens(user1, 1000);
    
    // 2. Tentar unstake imediatamente (deve falhar)
    try {
      await program.methods
        .unstake(new BN(500 * 10 ** 9))
        .accounts({ /* ... */ })
        .rpc();
      
      assert.fail("Should have thrown lock error");
    } catch (error) {
      assert.include(error.message, "LockPeriodNotEnded");
    }
  });
  
  it("Should allow unstake after lock period", async () => {
    // 1. Fazer stake
    await stakeTokens(user1, 1000);
    
    // 2. Avançar o tempo (usando provider simulador ou localnet)
    await advanceTime(7 * 24 * 60 * 60 + 1); // 7 dias + 1 segundo
    
    // 3. Unstake deve funcionar
    const tx = await program.methods
      .unstake(new BN(500 * 10 ** 9))
      .accounts({ /* ... */ })
      .rpc();
    
    assert.isOk(tx);
  });
  
  it("Should apply penalty for early unstake", async () => {
    // Staking com 30 dias de lock
    await stakeTokensWithLock(user1, 1000, 30);
    
    // Tentar unstake após 15 dias
    await advanceTime(15 * 24 * 60 * 60);
    
    const tx = await program.methods
      .unstake(new BN(1000 * 10 ** 9))
      .accounts({ /* ... */ })
      .rpc();
    
    // Verificar se penalty foi aplicado
    const userTokenAccount = await getTokenAccount(user1);
    const expectedAfterPenalty = 1000 * 0.98; // 2% penalty
    assert.approximately(userTokenAccount, expectedAfterPenalty, 0.01);
  });
});

// Função para avançar o tempo (para localnet)
async function advanceTime(seconds: number) {
  // Em localnet, podemos usar sleep ou mock do clock
  if (provider.connection.rpcEndpoint.includes("localhost")) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulação
    
    // Ou usar anchor.testing para mock
    const clock = await program.provider.connection.getAccountInfo(
      anchor.web3.SYSVAR_CLOCK_PUBKEY
    );
    // Modificar o clock (avançar seconds)
  }
}