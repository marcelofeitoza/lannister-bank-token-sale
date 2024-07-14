use anchor_lang::prelude::*;

use crate::state::whitelist::Whitelist;

#[derive(Accounts)]
pub struct AddToWhitelist<'info> {
    #[account(mut)]
    pub whitelist: Account<'info, Whitelist>,
    #[account(mut)]
    pub user: Signer<'info>,
}

pub fn add_to_whitelist_instruction(ctx: Context<AddToWhitelist>, user: Pubkey) -> Result<()> {
    let whitelist = &mut ctx.accounts.whitelist;
    if !whitelist.users.contains(&user) {
        whitelist.users.push(user);
    }
    Ok(())
}
