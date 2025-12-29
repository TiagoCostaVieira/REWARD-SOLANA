// tests/e2e/localnet.test.ts
import { startLocalnet, stopLocalnet } from "../utils/localnet.test";
import { deployProgram } from "../utils/deploy.test";
import { initializeWithRealTokens } from "../utils/setup";
import { Keypair } from "@solana/web3.js";
import { assert} from "chai";
import {
  fundUser,
  stakeTokens,
  claimRewards,
  getTotalStaked,
} from "../utils/actions";


describe("E2E Tests on Localnet", () => {
  before(async () => {
    // Iniciar localnet
    await startLocalnet();
    
    // Deploy do programa
    await deployProgram();
    
    // Inicializar com dados reais
    await initializeWithRealTokens();
  });
  
  after(async () => {
    await stopLocalnet();
  });
  
  it("Should handle concurrent users", async () => {
    const users = Array.from({ length: 10 }, () => Keypair.generate());
    const promises = users.map(async (user, index) => {
      // Cada usuário faz stake em momentos diferentes
      await fundUser(user);
      await stakeTokens(user, 100 + index * 10);
      
      if (index % 3 === 0) {
        await claimRewards(user);
      }
    });
    
    await Promise.all(promises);
    
    // Verificar estado final
    const totalStaked = await getTotalStaked();
    assert.isAbove(totalStaked, 0);
  });
});