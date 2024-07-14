use anchor_lang::prelude::*;

use crate::state::purchase::UserPurchase;

pub fn initialize_user_purchase_instruction(ctx: Context<InitializeUserPurchase>) -> Result<()> {
    let user_purchase = &mut ctx.accounts.user_purchase;
    user_purchase.user = *ctx.accounts.user.key;
    user_purchase.amount_purchased = 0; // Ensuring it's initialized to zero
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeUserPurchase<'info> {
    #[account(
        init,
        payer = user,
        seeds = [b"user_purchase", user.key().as_ref()],
        bump,
        space = UserPurchase::SIZE // Make sure this is correctly set to accommodate all data
    )]
    pub user_purchase: Account<'info, UserPurchase>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
