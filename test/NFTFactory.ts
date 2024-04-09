import { expect } from "chai"
import { deployments, ethers, getNamedAccounts } from "hardhat"
import { NFTFactory } from "typechain-types"

describe("NFTFactory", function () {
	const setupFixture = deployments.createFixture(async () => {
		await deployments.fixture()
		const signers = await getNamedAccounts()

		const contract = await ethers.deployContract("NFTFactory")

		return {
			contract,
			contractAddress: await contract.getAddress(),
			deployer: signers.deployer,
			accounts: await ethers.getSigners(),
		}
	})

	describe("Deployment Functionality", () => {
		it("Should deploy and create NFT successfully", async function () {
			const { contract, accounts } = await setupFixture()

			// Create NFT
			await contract.createNFT(
				"Test NFT",
				"TST",
				"Test NFT Description",
				"Test Platform",
				"https://example.com/",
				accounts[0].address
			)

			// Assert NFT creation
			const nft = await contract.nfts(0)
			expect(nft.description).to.equal("Test NFT Description")
			expect(nft.platform).to.equal("Test Platform")
			expect(nft.contractAddress).to.not.be.undefined
		})
	})
	describe("NFT Functionality", () => {
		it("Should return correct NFT count", async function () {
			const { contract, accounts } = await setupFixture()

			// Create NFT
			await contract.createNFT(
				"Test NFT",
				"TST",
				"Test NFT Description",
				"Test Platform",
				"https://example.com/",
				accounts[0].address
			)
			const nftCount = await contract.count()
			expect(nftCount).to.equal(1) // Assuming one NFT was created in the previous test
		})

		it("Should return correct NFT details", async function () {
			const { contract, accounts } = await setupFixture()

			// Create NFT
			await contract.createNFT(
				"Test NFT",
				"TST",
				"Test NFT Description",
				"Test Platform",
				"https://example.com/",
				accounts[0].address
			)
			const nftDetails = await contract.nfts(0)
			expect(nftDetails.description).to.equal("Test NFT Description")
			expect(nftDetails.platform).to.equal("Test Platform")
			expect(nftDetails.contractAddress).to.not.be.undefined
		})
	})

	describe("Ownership Functionality", () => {
		it("Should transfer ownership of the contract", async () => {
			const { contract, accounts } = await setupFixture()

			// Transfer ownership to another account
			await contract.transferOwnership(accounts[1].address)

			// Check that the new owner is set correctly
			expect(await contract.owner()).to.equal(accounts[1].address)
		})

		it("Should renounce ownership of the contract", async () => {
			const { contract } = await setupFixture()

			// Renounce ownership
			await contract.renounceOwnership()

			// Check that ownership is renounced
			const newOwner = await contract.owner()
			expect(newOwner).to.equal("0x0000000000000000000000000000000000000000")
		})
	})
})
