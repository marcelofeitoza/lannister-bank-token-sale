use anchor_lang::prelude::*;

#[account]
pub struct Whitelist {
    pub users: Vec<Pubkey>,
}

impl Whitelist {
    pub const SIZE: usize = 8 + 100 * 32;
}
