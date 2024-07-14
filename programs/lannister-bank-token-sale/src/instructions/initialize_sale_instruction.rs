use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::state::{sale::Sale, whitelist::Whitelist};

#[derive(Accounts)]
pub struct InitializeSaleContext<'info> {
    #[account(init, payer = payer, space = Sale::SIZE, seeds = [b"sale"], bump)]
    pub sale: Account<'info, Sale>,
    #[account(init, payer = payer, space = Whitelist::SIZE, seeds = [b"whitelist"], bump)]
    pub whitelist: Account<'info, Whitelist>,
    pub token_mint: Account<'info, Mint>,
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn initialize_sale_instruction(
    ctx: Context<InitializeSaleContext>,
    sale_bump: u8,
    whitelist_bump: u8,
    token_price: u64,
    max_purchase_per_wallet: u64,
) -> Result<()> {
    let sale = &mut ctx.accounts.sale;
    sale.token_mint = ctx.accounts.token_mint.key();
    sale.token_vault = ctx.accounts.token_vault.key();
    sale.sale_bump = sale_bump;
    sale.whitelist_bump = whitelist_bump;
    sale.token_price = token_price;
    sale.max_purchase_per_wallet = max_purchase_per_wallet;
    sale.tokens_sold = 0;

    Ok(())
}
