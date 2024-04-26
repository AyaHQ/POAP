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

		it("Should fetch all NFTs correctly", async function () {
			const { contract, accounts } = await setupFixture()

			// Create multiple NFTs
			await contract.createNFT(
				"Test NFT 1",
				"TST1",
				"Description 1",
				"Platform 1",
				"https://example1.com/",
				accounts[0].address
			)
			await contract.createNFT(
				"Test NFT 2",
				"TST2",
				"Description 2",
				"Platform 2",
				"https://example2.com/",
				accounts[0].address
			)

			// Fetch all NFTs
			const nfts = await contract.fetchNFTs()

			// Assert fetched NFTs
			expect(nfts.length).to.equal(2)
			expect(nfts[0].name).to.equal("Test NFT 1")
			expect(nfts[0].description).to.equal("Description 1")
			expect(nfts[0].platform).to.equal("Platform 1")
			expect(nfts[0].tokenBaseURI).to.equal("https://example1.com/")
			expect(nfts[1].name).to.equal("Test NFT 2")
			expect(nfts[1].description).to.equal("Description 2")
			expect(nfts[1].platform).to.equal("Platform 2")
			expect(nfts[1].tokenBaseURI).to.equal("https://example2.com/")
		})

		it("Should return the correct NFT by index", async function () {
			const { contract, accounts } = await setupFixture()

			// Create two NFTs to ensure the function can retrieve the correct one by index
			await contract.createNFT(
				"NFT Index 1",
				"IDX1",
				"First NFT for Indexing",
				"Index Platform 1",
				"https://exampleindex1.com/",
				accounts[0].address
			)
			await contract.createNFT(
				"NFT Index 2",
				"IDX2",
				"Second NFT for Indexing",
				"Index Platform 2",
				"https://exampleindex2.com/",
				accounts[0].address
			)

			// Retrieve the second NFT by index
			const indexedNFT = await contract.nfts(1)

			// Assertions to check if the retrieved NFT is correct
			expect(indexedNFT.name).to.equal("NFT Index 2")
			expect(indexedNFT.description).to.equal("Second NFT for Indexing")
			expect(indexedNFT.platform).to.equal("Index Platform 2")
			expect(indexedNFT.tokenBaseURI).to.equal("https://exampleindex2.com/")
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
