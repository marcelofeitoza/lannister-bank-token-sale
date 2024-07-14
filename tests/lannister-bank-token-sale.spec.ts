import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
	createAccount,
	createMint,
	getOrCreateAssociatedTokenAccount,
	mintTo,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { LannisterBankTokenSale } from "../target/types/lannister_bank_token_sale";

describe("lannister-bank-token-sale", () => {
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace
		.LannisterBankTokenSale as Program<LannisterBankTokenSale>;
	const provider = anchor.getProvider() as anchor.AnchorProvider;

	let tyrion: anchor.web3.Keypair;
	let jaime;

	const tokenPrice = new anchor.BN(1_000_000);
	const maxPurchase = new anchor.BN(10_000_000);

	let mint: PublicKey;
	let treasuryVault: PublicKey;

	beforeAll(async () => {
		tyrion = anchor.web3.Keypair.generate();
		jaime = anchor.web3.Keypair.generate();

		await provider.connection.confirmTransaction(
			await provider.connection.requestAirdrop(
				tyrion.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL
			)
		);
		await provider.connection.confirmTransaction(
			await provider.connection.requestAirdrop(
				jaime.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL
			)
		);

		mint = await createMint(
			provider.connection,
			tyrion,
			tyrion.publicKey,
			null,
			9
		);
		treasuryVault = await createAccount(
			provider.connection,
			tyrion,
			mint,
			tyrion.publicKey
		);
		await mintTo(
			provider.connection,
			tyrion,
			mint,
			treasuryVault,
			tyrion,
			1_000_000
		);
	});

	let salePDA: PublicKey;
	let saleBump: number;
	let councilPDA: PublicKey;
	let councilBump: number;

	it("Initializes the Royal Treasury", async () => {
		console.log(
			"Tyrion Lannister sets up the royal treasury for the sale of exclusive Lannister tokens"
		);

		[salePDA, saleBump] = PublicKey.findProgramAddressSync(
			[Buffer.from("sale")],
			program.programId
		);

		[councilPDA, councilBump] = PublicKey.findProgramAddressSync(
			[Buffer.from("whitelist")],
			program.programId
		);

		const tx = await program.methods
			.initializeSale(saleBump, councilBump, tokenPrice, maxPurchase)
			.accounts({
				sale: salePDA,
				whitelist: councilPDA,
				tokenMint: mint,
				tokenVault: treasuryVault,
				payer: tyrion.publicKey,
				systemProgram: SystemProgram.programId,
				tokenProgram: TOKEN_PROGRAM_ID,
			})
			.signers([tyrion])
			.rpc();
		console.log("Decree signed by Tyrion Lannister:", tx);

		const saleAccount = await program.account.sale.fetch(salePDA);

		expect(saleAccount.tokenMint.toBase58()).toBe(mint.toBase58());
		expect(saleAccount.tokenVault.toBase58()).toBe(
			treasuryVault.toBase58()
		);
		expect(saleAccount.saleBump).toBe(saleBump);
		expect(saleAccount.whitelistBump).toBe(councilBump);
		expect(saleAccount.tokenPrice.toNumber()).toBe(1_000_000);
		expect(saleAccount.maxPurchasePerWallet.toNumber()).toBe(10_000_000);

		console.log(
			"Royal treasury is now open for business with details:",
			saleAccount
		);
	});

	it("Grants access to the council", async () => {
		console.log(
			"Tyrion Lannister grants Jaime Lannister access to the council"
		);

		const tx = await program.methods
			.addToWhitelist(jaime.publicKey)
			.accounts({
				whitelist: councilPDA,
				user: tyrion.publicKey,
			})
			.signers([tyrion])
			.rpc();
		console.log(
			"Tyrion granted access to Jaime to the Lannister council",
			tx
		);

		const whitelistAccount = await program.account.whitelist.fetch(
			councilPDA
		);
		expect(whitelistAccount.users).toContainEqual(jaime.publicKey);
	});

	let userPurchasePDA: PublicKey;
	let userPurchaseBump: number;

	it("Initializes user purchase", async () => {
		[userPurchasePDA, userPurchaseBump] = PublicKey.findProgramAddressSync(
			[Buffer.from("user_purchase"), tyrion.publicKey.toBuffer()],
			program.programId
		);
		const tx = await program.methods
			.initializeUserPurchase()
			.accounts({
				userPurchase: userPurchasePDA,
				user: tyrion.publicKey,
				systemProgram: SystemProgram.programId,
			})
			.signers([tyrion])
			.rpc();
		console.log("User purchase initialization transaction signature:", tx);

		const userPurchase = await program.account.userPurchase.fetch(
			userPurchasePDA
		);

		expect(userPurchase.amountPurchased.toNumber()).toBe(0);
	});

	it("Denies purchasing more than max allowed", async () => {
		console.log("Jaime Lannister tries to purchase more than allowed");

		const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
			provider.connection,
			tyrion,
			mint,
			tyrion.publicKey
		);

		try {
			await program.methods
				.purchaseTokens(new anchor.BN(15_000_000))
				.accounts({
					sale: salePDA,
					whitelist: councilPDA,
					userPurchase: userPurchasePDA,
					user: tyrion.publicKey,
					tokenVault: treasuryVault,
					userTokenAccount: buyerTokenAccount.address,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.signers([tyrion])
				.rpc();

			expect(true).toBe(false);
		} catch (error) {
			console.log(
				"Transaction blocked: Jaime tried to purchase too much"
			);
			expect(error).toBeDefined();
		}
	});

	it("Purchases Lannister tokens within the limits", async () => {
		console.log("Tyrion decides to make a legitimate purchase of tokens");

		const buyerTokenAccount = await getOrCreateAssociatedTokenAccount(
			provider.connection,
			tyrion,
			mint,
			tyrion.publicKey
		);

		console.log("Buyer token account setup:", buyerTokenAccount);

		let accountInfo = await provider.connection.getAccountInfo(
			buyerTokenAccount.address
		);
		let balance = accountInfo.lamports;

		console.log(`Attempting to purchase tokens...`);
		console.log(
			`User Token Account Address: ${buyerTokenAccount.address.toBase58()}`
		);
		console.log(
			`Token Account Owner: ${buyerTokenAccount.owner.toBase58()}`
		);
		console.log(`Token Account Balance: ${buyerTokenAccount.amount}`);
		console.log(`Token Vault Balance: (fetch and log this as well)`);

		console.log(`Transaction Signers: ${tyrion.publicKey.toBase58()}`);

		console.log("Balance available:", balance);

		const txPurchase = await program.methods
			.purchaseTokens(new anchor.BN(5))
			.accounts({
				sale: salePDA,
				whitelist: councilPDA,
				userPurchase: userPurchasePDA,
				user: tyrion.publicKey,
				tokenVault: treasuryVault,
				userTokenAccount: buyerTokenAccount.address,
				tokenProgram: TOKEN_PROGRAM_ID,
			})
			.signers([tyrion])
			.rpc();

		console.log("Transaction approved:", txPurchase);

		const saleAccount = await program.account.sale.fetch(salePDA);
		console.log("Royal treasury after Tyrion's purchase:", saleAccount);
	});
});
