pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
    let user_state = &mut ctx.accounts.user_state;
    let reward_pool = &mut ctx.accounts.reward_pool;
    let global_pool = &ctx.accounts.global_pool;

    // Update the reward pool to ensure rewards are up-to-date
    update_reward_pool(reward_pool, global_pool)?;

    // Calculate earned rewards
    let earned = ((user_state.staked_amount as u128)
        .checked_mul(
            reward_pool
                .reward_per_token_stored
                .checked_sub(user_state.reward_per_token_paid)
                .unwrap(),
        )
        .unwrap()
        .checked_div(1_000_000_000_000)
        .unwrap()) as u64;

    if earned > 0 {
        // Transfer rewards from reward vault to user reward account
        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_reward_account.to_account_info(),
            authority: ctx.accounts.reward_pool.to_account_info(),
        };

        let seeds = &[b"reward_pool".as_ref(), &[ctx.accounts.reward_pool.bump]];
        let signer = &[&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer,
        );

        token::transfer(cpi_context, earned)?;
    }

    // Update user state
    user_state.reward_per_token_paid = reward_pool.reward_per_token_stored;
    user_state.rewards += earned;

    Ok(())
}