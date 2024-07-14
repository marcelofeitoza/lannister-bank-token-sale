use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{
    errors::ErrorCode,
    state::{purchase::UserPurchase, sale::Sale, whitelist::Whitelist},
};

#[derive(Accounts)]
pub struct PurchaseTokens<'info> {
    #[account(mut)]
    pub sale: Account<'info, Sale>,
    #[account(mut)]
    pub whitelist: Account<'info, Whitelist>,
    #[account(mut)]
    pub user_purchase: Account<'info, UserPurchase>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub token_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn purchase_tokens_instruction(ctx: Context<PurchaseTokens>, amount: u64) -> Result<()> {
    let sale = &mut ctx.accounts.sale;
    let user_purchase = &mut ctx.accounts.user_purchase;

    require!(
        amount > 0 && amount <= sale.max_purchase_per_wallet,
        ErrorCode::InvalidPurchaseAmount
    );

    let total_cost = amount
        .checked_mul(sale.token_price)
        .ok_or(ErrorCode::Overflow)?;

    let cpi_accounts = Transfer {
        from: ctx.accounts.user_token_account.to_account_info().clone(),
        to: ctx.accounts.token_vault.to_account_info().clone(),
        authority: ctx.accounts.user.to_account_info().clone(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, total_cost)?;

    user_purchase.amount_purchased = user_purchase
        .amount_purchased
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;

    sale.tokens_sold = sale
        .tokens_sold
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;

    Ok(())
}
