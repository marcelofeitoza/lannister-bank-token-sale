use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Not whitelisted")]
    NotWhitelisted,
    #[msg("Purchase limit exceeded")]
    PurchaseLimitExceeded,
    #[msg("Overflow error")]
    Overflow,
    #[msg("Invalid purchase amount")]
    InvalidPurchaseAmount,
}
