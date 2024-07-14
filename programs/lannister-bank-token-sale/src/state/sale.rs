use anchor_lang::prelude::*;

#[account]
pub struct Sale {
    pub token_mint: Pubkey,
    pub token_vault: Pubkey,
    pub sale_bump: u8,
    pub whitelist_bump: u8,
    pub token_price: u64,
    pub max_purchase_per_wallet: u64,
    pub tokens_sold: u64,
}

impl Sale {
    pub const SIZE: usize = 8 + 32 + 32 + 1 + 1 + 8 + 8 + 8;
}
