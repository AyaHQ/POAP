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

	// describe("Minting with Different Parameters", () => {
	// 	it("Should mint tokens with different group IDs", async () => {
	// 		const { contract, accounts } = await setupFixture()

	// 		// Whitelist the account
	// 		await contract.whitelist(1, accounts[1].address)
	// 		await contract.whitelist(2, accounts[1].address)

	// 		// Mint tokens with different group IDs
	// 		await contract.connect(accounts[1]).mint(1, "ayaId1", "platformId1")
	// 		await contract.connect(accounts[1]).mint(2, "ayaId2", "platformId2")

	// 		// Check that the tokens were minted successfully
	// 		expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
	// 		expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
	// 	})

	// 	it("Should mint tokens with different Aya IDs and platform IDs", async () => {
	// 		const { contract, accounts } = await setupFixture()

	// 		// Whitelist the account
	// 		await contract.whitelist(1, accounts[1].address)

	// 		// Mint tokens with different Aya IDs and platform IDs
	// 		await contract.connect(accounts[1]).mint(1, "ayaId1", "platformId1")
	// 		await contract.connect(accounts[1]).mint(1, "ayaId2", "platformId2")

	// 		// Check that the tokens were minted successfully
	// 		expect(await contract.ownerOf(1)).to.equal(accounts[1].address)
	// 		expect(await contract.ownerOf(2)).to.equal(accounts[1].address)
	// 		expect(await contract.totalSupply()).to.equal(2)
	// 	})
	// })

	// describe("Updating Base Token URI", () => {
	// 	it("Should update the base token URI successfully", async () => {
	// 		const { contract, accounts } = await setupFixture()

	// 		const newBaseTokenURI = "ipfs://new-base-uri/"

	// 		// Update the base token URI
	// 		await contract.setBaseTokenURI(newBaseTokenURI)

	// 		// Check that the base token URI was updated successfully
	// 		expect(await contract.baseTokenURI()).to.equal(newBaseTokenURI)

	// 		// Mint a token
	// 		await contract.connect(accounts[1]).mint(1, "ayaId", "platformId")

	// 		// Check that the token URI reflects the updated base token URI
	// 		const tokenId = 1
	// 		const expectedTokenURI = `${newBaseTokenURI}${tokenId}`
	// 		expect(await contract.tokenURI(tokenId)).to.equal(expectedTokenURI)
	// 	})
	// })
})
