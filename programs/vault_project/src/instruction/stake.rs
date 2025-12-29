use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[derive(accounts)]
pub struct Stake<'Info>{

    #[account(mut)]
    pub user: Signer<'Info>

    #[account(mut)]
    pub global_pool: Account<'Info, GlobalPool>,

    #[account(
        init_if_needed,
        payer = user, 
        space = 8 + UserState::INIT_SPACE,
        seeds = [b'user_state', user.key().as_ref]
    )]
    pub user_state: Account<'info, UserState>


    #[account(mut)]
    pub user_token_account: Account<'info,TokenAccount>

    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub program_vault: Account<'info, TokenAccount>

    pub token_program: Program<'info, Token>
    pub system_program: Program<'info, System>
}

pub fn stake(ctx: Context<Stake>, amount: u65) -> Result<()>{
     let cpi_accounts = Transfer {
        from:ctx.accounts.user_token_account.to_account_info(),
        to:ctx.accounts.program_vault.to_account_info(),
        authority:ctx.accounts.to_account_info(),
     }

     let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
     )
     token::Transfer(cpi_context, amount)?;
     user_state.staked_amount += amount;

     user_state.stake_timestamp = Clock::get()?.unix_timestamp;

    user_state.last_reward_timestamp = Clock::get()?.unix_timestamp;

    global_pool.total_staked += amount;

    Ok(());
} 