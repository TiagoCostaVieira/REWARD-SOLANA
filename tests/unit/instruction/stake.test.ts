import { 
  program, 
  provider, 
  BN,
  assert,
  fundUser,
  stakeTokens,
  createTestUser,
  initializeGlobalState 
} from '../../utils';

import { Keypair } from '@solana/web3.js';

describe('Stake Instruction', () => {
  let user: Keypair;
  let authority: Keypair;

  before(async () => {
    // Setup inicial
    authority = createTestUser();
    user = createTestUser();
    
    await fundUser(authority);
    await fundUser(user);
    
    await initializeGlobalState(authority);
  });

  it('Should stake tokens successfully', async () => {
    const amount = 1000;
    const tx = await stakeTokens(user, amount);
    
    assert.isString(tx);
    assert.lengthOf(tx, 88); // Solana signature length
  });

  it('Should fail when staking zero tokens', async () => {
    try {
      await stakeTokens(user, 0);
      assert.fail('Should have thrown');
    } catch (error: any) {
      assert.include(error.message, 'Invalid amount');
    }
  });
});