import { expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
// import { makeInterfaceId } from "@openzeppelin/test-helpers"

describe("NFTContract", () => {
	const setupFixture = deployments.createFixture(async () => {
		await deployments.fixture()
		const signers = await getNamedAccounts()

		const _name = "Aya-membershipNFT"
		const _symbol = "AYA-NFT"
		const _baseURI = "ipfs://base-uri/"

		const contract = await ethers.deployContract(
			"NFTContract",
			[_name, _symbol, _baseURI],
			await ethers.getSigner(signers.deployer)
		)

		return {
			contract,
			contractAddress: await contract.getAddress(),
			deployer: signers.deployer,
			accounts: await ethers.getSigners(),
			contractConstructor: {
				_name,
				_symbol,
				_baseURI,
			},
		}
	})

	describe("Deployment Functionality", () => {
		it("Should Return Valid Contract Configurations Passed In Constructor", async () => {
			const { contractConstructor, contract } = await setupFixture()

			expect(await contract.name()).to.equal(contractConstructor._name)
			expect(await contract.symbol()).to.equal(contractConstructor._symbol)
		})
	})

	describe("Minting Functionality", () => {
		it("Should mint tokens successfully", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist the account
			await contract.whitelist(1, accounts[1].address)

			// Mint a token for the whitelisted account
			await contract.connect(accounts[1]).mint(1, "ayaId", "platformId")

			// Check that the token was minted successfully
			expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
			expect(await contract.totalSupply()).to.equal(1)
		})

		it("Should not mint tokens for address not on whitelist", async () => {
			const { contract, accounts } = await setupFixture()

			// Attempt to mint a token for an address not on the whitelist
			await expect(contract.mint(1, "ayaId", "platformId")).to.be.revertedWith("Sender is not whitelisted")
		})

		it("Should not mint tokens when paused", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist the account
			await contract.whitelist(1, accounts[1].address)

			// Pause minting
			await contract.setPaused(true)

			// Attempt to mint a token
			await expect(contract.connect(accounts[1]).mint(1, "ayaId", "platformId")).to.be.revertedWith(
				"Minting is currently paused"
			)
		})
	})

	it("Should whitelist and blacklist addresses successfully", async () => {
		const { contract, accounts } = await setupFixture()

		// Whitelist an address
		await contract.whitelist(1, accounts[1].address)
		expect(await contract.isWhitelisted(1, accounts[1].address)).to.be.true

		// Blacklist the same address
		await contract.blacklist(1, accounts[1].address)
		expect(await contract.isWhitelisted(1, accounts[1].address)).to.be.false
	})
})
