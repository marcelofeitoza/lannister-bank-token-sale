use anchor_lang::prelude::*;

mod errors;
mod instructions;
mod state;

use instructions::*;

declare_id!("D6dvAzWWpJBtvSe1b2NzZjvqWfxeYAsimbyi2DRvCzQk");

#[program]
pub mod lannister_bank_token_sale {
    use super::*;

    pub fn initialize_sale(
        ctx: Context<InitializeSaleContext>,
        sale_bump: u8,
        whitelist_bump: u8,
        token_price: u64,
        max_purchase_per_wallet: u64,
    ) -> Result<()> {
        initialize_sale_instruction(
            ctx,
            sale_bump,
            whitelist_bump,
            token_price,
            max_purchase_per_wallet,
        )
    }

    pub fn initialize_user_purchase(ctx: Context<InitializeUserPurchase>) -> Result<()> {
        initialize_user_purchase_instruction(ctx)
    }

    pub fn add_to_whitelist(ctx: Context<AddToWhitelist>, user: Pubkey) -> Result<()> {
        add_to_whitelist_instruction(ctx, user)
    }

    pub fn purchase_tokens(ctx: Context<PurchaseTokens>, amount: u64) -> Result<()> {
        purchase_tokens_instruction(ctx, amount)
    }
}
