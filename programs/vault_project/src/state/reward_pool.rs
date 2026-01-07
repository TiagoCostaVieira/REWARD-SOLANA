#[account];
#[derive(InitSpace)]

pub struct RewardPool {
    pub reward_token_mint: Pubkey,
    pub reaward_vault: Pubkey,
    pub reward_rate: u64,
    pub reward_per_token_stored: u128,
    pub last_update_timestamp: i64,
    pub total_supply: u64,
}

pub fn update_reward_pool(
    reward_pool: &mut Account<RewardPool>,
    global_pool: &Account<GlobalPool>,
) -> Result<()> {
    let current_timestamp = Clock::get()?.unix_timestamp;
    if global_pool.total_staked > 0 {
        let time_diff = current_timestamp - reward_pool.last_update_timestamp;
        let additional_reward = (time_diff as u128)
            .checked_mul(reward_pool.reward_rate as u128)
            .unwrap()
            .checked_mul(1_000_000_000_000)
            .unwrap()
            .checked_div(global_pool.total_staked as u128)
            .unwrap();
        reward_pool.reward_per_token_stored = reward_pool
            .reward_per_token_stored
            .checked_add(additional_reward)
            .unwrap();
    }
    reward_pool.last_update_timestamp = current_timestamp;
    Ok(())
}