use anchor_lang::prelude::*;

#[account]
pub struct UserPurchase {
    pub user: Pubkey,
    pub amount_purchased: u64,
}

impl UserPurchase {
    pub const SIZE: usize = 8 + 32 + 8;
}
