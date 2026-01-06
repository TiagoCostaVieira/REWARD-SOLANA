pub const GLOBAL_STATE_SEED: &[u8] = b"global_state";
pub const USER_POOL_SEED: &[u8] = b"user-pool";

pub const DISCRIMINATOR_LEN: usize = 8;
pub const PUBKEY_LEN: usize = 32;
pub const U64_LEN: usize = 8;
pub const U8_LEN: usize = 1;
pub const DEFAULT_REWARD_RATE: u64 = 100;
pub const MAX_REWARD_PER_SLOT: u64 = 1_000;

pub const GLOBAL_STATE_SIZE: usize = 
    DISCRIMINATOR_LEN +
    U64_LEN +
    U8_LEN;

pub const USER_POOL_SEED: usize = 
  DISCRIMINATOR_LEN +
    PUBKEY_LEN + // authority
    U64_LEN +    // amount
    U64_LEN +    // total_staked
    U64_LEN +    // reward_per_token_stored
    U64_LEN +    // reward_rate
    U64_LEN +    // last_update_slot
    U64_LEN +    // deposit_slot
    U64_LEN +    // reward_debt
    U8_LEN;      // bump