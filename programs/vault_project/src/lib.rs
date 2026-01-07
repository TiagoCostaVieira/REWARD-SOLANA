mod error;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, MintTo, Mint};
use anchor_spl::associated_token::AssociatedToken;
use error::VaultError; 
declare_id!("G21goJwCydZbzy4UpY1sxFNvwR4WNZMTcEyYuY3PAdYq");

#[program]
pub mod vault_project {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let global_state = &mut ctx.accounts.globalstate;
        global_state.total_reward = 0;
        global_state.bump = ctx.bumps.globalstate; 
        msg!("GlobalState initialized!");
        Ok(())
    }

    pub fn update_total_reward(ctx: Context<UpdateTotalReward>, amount: u64) -> Result<()> {
        let global_state = &mut ctx.accounts.globalstate;
        global_state.total_reward += amount;
        msg!("Total reward updated to: {}", global_state.total_reward);
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.user_pool;
        let clock = Clock::get()?;
        
        // Initialize the pool if it is new.
        if pool.authority == Pubkey::default() {
            pool.authority = ctx.accounts.authority.key();
            pool.amount = 0;
            pool.total_staked = 0;
            pool.reward_per_token_stored = 0;
            pool.reward_rate = DEFAULT_REWARD_RATE; 
            pool.last_update_slot = clock.slot;
            pool.deposit_slot = clock.slot;
            pool.reward_debt = 0;
        }
        
        // Calculates and distributes pending rewards before new staking.
        if pool.amount > 0 {
            let slots_passed = clock.slot.checked_sub(pool.last_update_slot).unwrap_or(0);
            let reward = slots_passed.checked_mul(pool.reward_rate).unwrap_or(0);
            
            if reward > 0 {
                // Mint rewards for the user
                let cpi_accounts = MintTo {
                    mint: ctx.accounts.staking_token.to_account_info(),
                    to: ctx.accounts.user_staking_wallet.to_account_info(),
                    authority: ctx.accounts.admin.to_account_info(),
                };
                
                let cpi_program = ctx.accounts.token_program.to_account_info();
                let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
                token::mint_to(cpi_ctx, reward)?;
                
                // Updates the global rewards status.
                let global_state = &mut ctx.accounts.global_state;
                global_state.total_reward += reward;
            }
        }

        pub fn unstake(ctx: Context<Unstake>, amount:u64) -> Result<()>{
            require!(amount > 0, VaultError::ZeroStakeAmount);
            require!(!ctx.accounts.global_state.paused, VaultError::PoolPaused);
            
            let pool = &mut ctx.accounts.user_pool;
            let clock = Clock::get()?;

            require!(amount <= pool.amount, ErrorCode::InsufficientStake);

            let slots_passed = clock.slot
                               .checked_sub(pool.last_update_slot)
                               .ok_or(VaultError::InvalidTimestamp);
            
            
            if slots_passed > 0 && pool.amount > 0 {
                let accumulated_reward = slots_passed
                                        .checked_sub(pool.reward_rate)
                                        .ok_or(VaultError::RewardOverflow)?;

                
                pool.reward_per_token_stored = pool.reward_per_token_stored
                                                .cheked_add(accumulated_reward)
                                                .ok_or(VaultError::ArithmeticOverflow)

                let pending_tokens = pool.amount
                        .checked_mul(
                        pool.reward_per_token_stored
                        .checked_sub(pool.reward_debt)
                        .ok_or(VaultError::ArithmeticOverflow)?
                    )
                    .ok_or(VaultError::ArithmeticOverflow)?;

                    if pending_tokens > 0 {
                        
                        let cpi_accounts = MintTo{
                            mint: ctx.accounts.staking_token.to_account_info(),
                            to: ctx:accounts.user_staking_wallet.to_account_info(),
                            authority: ctx.accounts.admin.to_account_info()
                        };
                        let sginer_seed = $[
                            GLOBAL_STATE_SEED, 
                            &[ctx.accounts.global_state.bump]
                        ];
                        let sginer_seed = &[&seeds[...]];

                        let cpi_accounts = ctx.accounts.token_program.to_account_info;
                        let cpi_ctx = CpiContext::new_with_signer(
                            cpi_program,
                            cpi_accounts,
                            sginer_seed
                        );
                        token::mint_to(cpi_ctx, pending_tokens)?;

                        msg!("Pending rewards distributed: {}", pending_tokens);
                    }
            }

            pool.reward_debt = pool.reward_per_token_stored
                                .checked_mul(pool.amount.checked_sub(amount).unwrap_or(0))
                                .ok_or(VaultError::ArithmeticOverflow)?;

            pool.amount = pool.amount
                          .checked_sub(amount)
                          .ok_or(VaultError::ArithmeticOverflow)?;

            pool.last_update_slot = clock.slot;

            let transfer_cpi_accounts = Transfer{
                from: ctx.accounts.pool_token_account.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.user_pool.to_account_info(),
            };

            let seed = &[
                USER_POOL_SEED,
                ctx.accounts.authority.key().as_ref(),
                &[pool.bump]
            ];
            let signer_seed = &[&seeds[...]];

            let transfer_cpi_program = ctx.accounts.token_program.to_account_info();
            let transfer_cpi_ctx = CpiContext::new_with_signer(
                transfer_cpi_program,
                transfer_cpi_accounts,
                signer_seeds
            );

            token::transfer(transfer_cpi_ctx, amount)?;
            msg!("Unstaked {} tokens successfully", amount);
            
            Ok(())
        }
        
        // Transferring tokens from the user to the pool.
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.pool_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        let transfer_cpi_program = ctx.accounts.token_program.to_account_info();
        let transfer_cpi_ctx = CpiContext::new(transfer_cpi_program, transfer_cpi_accounts);
        token::transfer(transfer_cpi_ctx, amount)?;
        
        // update pool state
        pool.amount += amount;
        pool.total_staked += amount;
        pool.last_update_slot = clock.slot;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = GLOBAL_STATE_SIZE,
        seeds = [GLOBAL_STATE_SEED],
        bump       
    )]
    pub globalstate: Account<'info, GlobalState>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTotalReward<'info> {
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump = globalstate.bump  
    )]
    pub globalstate: Account<'info, GlobalState>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = authority,
        space = USER_POOL_SIZE,
        seeds = [GLOBAL_STATE_SEED, authority.key().as_ref()],
        bump
    )]
    pub user_pool: Account<'info, UserPool>,
    
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub staking_token: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = staking_token,
        associated_token::authority = authority
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = staking_token,
        associated_token::authority = user_pool
    )]
    pub pool_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = staking_token,
        associated_token::authority = authority
    )]
    pub user_staking_wallet: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

// Data structure
#[account]
pub struct GlobalState {
    pub total_reward: u64,
    pub bump: u8,
}

#[account]
pub struct UserPool {
    pub authority: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
    pub reward_per_token_stored: u64,
    pub reward_rate: u64,
    pub last_update_slot: u64,
    pub deposit_slot: u64,
    pub reward_debt: u64,
    pub bump: u8,
}