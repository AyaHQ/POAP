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
		const _owner = await ethers.getSigner(signers.deployer) // Convert _owner to ethers.Signer object

		const contract = await ethers.deployContract(
			"NFTContract",
			[_name, _symbol, _baseURI, _owner.address],
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
				_owner,
			},
		}
	})

	describe("Deployment Functionality", () => {
		it("Should Return Valid Contract Configurations Passed In Constructor", async () => {
			const { contractConstructor, contract } = await setupFixture()

			expect(await contract.name()).to.equal(contractConstructor._name)
			expect(await contract.symbol()).to.equal(contractConstructor._symbol)
			expect(await contract._baseTokenURI()).to.equal(contractConstructor._baseURI)
			expect(await contract.owner()).to.equal(contractConstructor._owner.address)
		})
	})

	describe("Minting Functionality", () => {
		it("Should mint tokens successfully", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist the account
			await contract.whitelist(accounts[1].address)

			// Mint a token for the whitelisted account
			await contract.connect(accounts[1]).mint("ayaId", "platformId")

			// Check that the token was minted successfully
			expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
			expect(await contract.totalSupply()).to.equal(1)
		})

		it("Should not mint tokens for address not on whitelist", async () => {
			const { contract, accounts } = await setupFixture()

			expect(contract.connect(accounts[1]).mint("ayaId", "platformId")).to.be.revertedWith(
				"You are not whitelisted to mint"
			)
		})
		it("Should not mint tokens when paused", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist the account
			await contract.whitelist(accounts[1].address)

			// Pause minting. contract must be paused by the owner
			await contract.setPaused(true)

			// Check the paused state after calling setPaused
			const pausedState = await contract.paused()
			expect(pausedState).to.equal(true)
			expect(contract.connect(accounts[1]).mint("ayaId", "platformId")).to.be.revertedWith(
				"Miniting is currrently paused"
			)
		})

		it("Should mint tokens when unpaused", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist the account
			await contract.whitelist(accounts[1].address)

			// Pause minting. contract must be paused by the owner
			await contract.setPaused(true)

			// Check the paused state after calling setPaused
			const pausedState = await contract.paused()
			expect(pausedState).to.equal(true)

			// Unpause minting
			await contract.setPaused(false)

			// Check the paused state after calling setPaused
			const unpausedState = await contract.paused()
			expect(unpausedState).to.equal(false)

			// Mint a token for the whitelisted account
			await contract.connect(accounts[1]).mint("ayaId", "platformId")

			// Check that the token was minted successfully
			expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
			expect(await contract.totalSupply()).to.equal(1)
		})

		it("Should mint tokens for specified address", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist an address
			await contract.whitelist(accounts[1].address)
			expect(await contract.isWhitelisted(accounts[1].address)).to.be.true

			// Mint a token for a specified address by the contract owner
			await contract.mintFor("ayaId", "platformId", accounts[1].address)

			// Check that the token was minted successfully
			expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
			expect(await contract.totalSupply()).to.equal(1)
		})

		it("Should not mint tokens for address not on whitelist", async () => {
			const { contract, accounts } = await setupFixture()

			expect(contract.mintFor("ayaId", "platformId", accounts[1].address)).to.be.revertedWith(
				"You are not whitelisted to mint"
			)
		})

		it("should not mint tokens for specified address by another address", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist an address
			await contract.whitelist(accounts[2].address)
			expect(await contract.isWhitelisted(accounts[2].address)).to.be.true

			// Mint a token for a specified address by another address
			expect(
				contract.connect(accounts[1]).mintFor("ayaId", "platformId", accounts[2].address)
			).to.be.revertedWith("You are not allowed to mint for another address")

			// Check that the token was not minted successfully
			expect(await contract.totalSupply()).to.equal(0)
		})
	})

	describe("Whitelisting Functionality", () => {
		it("Should whitelist and blacklist addresses successfully", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist an address
			await contract.whitelist(accounts[1].address)
			expect(await contract.isWhitelisted(accounts[1].address)).to.be.true

			// Blacklist the same address
			await contract.blacklist(accounts[1].address)
			expect(await contract.isWhitelisted(accounts[1].address)).to.be.false
		})

		it("Should  batch whitelist multiple addresses", async () => {
			const { contract, accounts } = await setupFixture()
			await contract.batchWhitelist([
				accounts[1].address,
				accounts[2].address,
				accounts[3].address,
				accounts[4].address,
			])
			expect(await contract.isWhitelisted(accounts[1].address)).to.be.true
			expect(await contract.isWhitelisted(accounts[2].address)).to.be.true
			expect(await contract.isWhitelisted(accounts[3].address)).to.be.true
			expect(await contract.isWhitelisted(accounts[4].address)).to.be.true
		})
	})

	describe("Updating Base Token URI", () => {
		it("Should update the base token URI successfully", async () => {
			const { contract, accounts } = await setupFixture()

			const newBaseTokenURI = "ipfs://new-base-uri/"

			// Update the base token URI
			await contract.setBaseTokenURI(newBaseTokenURI)

			// Whitelist an address
			await contract.whitelist(accounts[1].address)
			expect(await contract.isWhitelisted(accounts[1].address)).to.be.true

			// Check that the base token URI was updated successfully
			expect(await contract._baseTokenURI()).to.equal(newBaseTokenURI)

			// Mint a token
			await contract.connect(accounts[1]).mint("ayaId", "platformId")

			// Check that the token URI reflects the updated base token URI
			const tokenId = 1
			const expectedTokenURI = `${newBaseTokenURI}${tokenId}`
			expect(await contract.tokenURI(tokenId)).to.equal(expectedTokenURI)
		})
	})

	describe("Token Transfer", () => {
		it("Should fail to transfer tokens due to soulbound restriction", async () => {
			const { contract, accounts } = await setupFixture()

			// Whitelist the accounts
			await contract.whitelist(accounts[1].address)

			// Mint a token for the first account
			await contract.connect(accounts[1]).mint("ayaId", "platformId")
			expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
			expect(await contract.totalSupply()).to.equal(1)

			// Attempt to transfer the token from the first account to the second account
			// This should fail due to the soulbound restriction
			await expect(
				contract.connect(accounts[1]).transferFrom(accounts[1].address, accounts[2].address, 1)
			).to.be.revertedWith("Soulbound: Transfer failed")

			// Check that the token ownership remains unchanged
			expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
		})
	})
})
