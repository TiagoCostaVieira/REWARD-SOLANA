// tests/performance/gas.test.ts
describe("Gas Usage Tests", () => {
  it("Should measure transaction costs", async () => {
    const stakeTx = await program.methods
      .stake(new BN(1000 * 10 ** 9))
      .accounts({ /* ... */ })
      .transaction();
    
    const stakeTxSize = stakeTx.serialize().length;
    console.log(`Stake tx size: ${stakeTxSize} bytes`);
    
    // Estimar custo em lamports
    const feeCalculator = await provider.connection.getFeeCalculatorForBlockhash(
      (await provider.connection.getLatestBlockhash()).blockhash
    );
    
    const estimatedFee = feeCalculator.value.lamportsPerSignature * 2; // Assinaturas
    console.log(`Estimated fee: ${estimatedFee} lamports`);
    
    // Benchmark
    const start = Date.now();
    for (let i = 0; i < 10; i++) {
      await stakeTokens(user1, 100);
    }
    const end = Date.now();
    
    console.log(`Average tx time: ${(end - start) / 10}ms`);
  });
});