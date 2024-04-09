import { expect } from "chai"
import { AddressLike, ContractTransactionResponse, Typed } from "ethers"
import { ethers } from "hardhat"
import { NFTFactory } from "typechain-types"

describe("NFTFactory", function () {
	let NFTFactory
	let nftFactory: NFTFactory & { deploymentTransaction(): ContractTransactionResponse }
	let owner: {
		address: AddressLike
	}
	let addr1: {
		provider: unknown | never | any
		address: Typed | AddressLike
	}
	let addr2: { address: Typed | AddressLike }

	beforeEach(async function () {
		;[owner, addr1, addr2] = await ethers.getSigners()
		NFTFactory = await ethers.getContractFactory("NFTFactory")
		nftFactory = await NFTFactory.deploy()
		await (await (nftFactory.deploymentTransaction() as unknown as Promise<ContractTransactionResponse>)).wait()
	})

	describe("Deployment Functionality", () => {
		it("Should deploy and create NFT successfully", async function () {
			const name = "MyNFT"
			const symbol = "MNFT"
			const description = "My NFT Description"
			const platform = "Ethereum"
			const tokenBaseURI = "ipfs://baseURI/"

			await nftFactory.createNFT(name, symbol, description, platform, tokenBaseURI)

			const nft = await nftFactory.nfts(0)

			expect(nft.description).to.equal(description)
			expect(nft.platform).to.equal(platform)
			expect(nft.contractAddress).to.not.be.null
		})
	})

	describe("admin functionalities", () => {
		it("Should set contract to paused state", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await nftFactory.setPaused(0, true)

			const nft = await nftFactory.nfts(0)
			const contract = await ethers.getContractAt("NFTContract", nft.contractAddress)
			const paused = await contract.paused()
			expect(paused).to.be.true
		})

		it("should check owner of the contract", async function () {
			expect(await nftFactory.owner()).to.equal(owner.address)
		})

		it("Should whitelist an address for a specific NFT contract", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await nftFactory.whitelist(0, addr1.address)

			const contract = await ethers.getContractAt("NFTContract", (await nftFactory.nfts(0)).contractAddress)
			expect(await contract.isWhitelisted(addr1.address)).to.be.true
		})

		it("Should batch whitelist addresses for a specific NFT contract", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await nftFactory.batchWhitelistNFTContract(0, [addr1.address as AddressLike, addr2.address as AddressLike])

			const contract = await ethers.getContractAt("NFTContract", (await nftFactory.nfts(0)).contractAddress)
			expect(await contract.isWhitelisted(addr1.address)).to.be.true
			expect(await contract.isWhitelisted(addr2.address)).to.be.true
		})

		it("Should blacklist an address for a specific NFT contract", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await nftFactory.whitelist(0, addr1.address)

			await nftFactory.blacklist(0, addr1.address)

			const contract = await ethers.getContractAt("NFTContract", (await nftFactory.nfts(0)).contractAddress)
			expect(await contract.isWhitelisted(addr1.address)).to.be.false
		})

		it("Should update the base token URI for a specific NFT contract", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			const newBaseURI = "ipfs://newBaseURI/"
			await nftFactory.updateNFTBaseTokenURI(0, newBaseURI)

			const contract = await ethers.getContractAt("NFTContract", (await nftFactory.nfts(0)).contractAddress)
			expect(await contract._baseTokenURI()).to.equal(newBaseURI)
		})
	})

	describe("non-owner functionalities", () => {
		it("Should not allow non-owner to call setPaused", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await expect(nftFactory.connect(addr1).setPaused(0, true)).to.be.reverted
		})

		it("Should revert if non-owner attempts to whitelist an address", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await expect(nftFactory.connect(addr1).whitelist(0, addr2.address)).to.be.reverted
		})

		it("Should revert if non-owner attempts to batch whitelist addresses", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await expect(nftFactory.connect(addr1).batchWhitelistNFTContract(0, [addr2.address as AddressLike])).to.be
				.reverted
		})

		it("Should revert if non-owner attempts to blacklist an address", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await expect(nftFactory.connect(addr1).blacklist(0, addr1.address)).to.be.reverted
		})

		it("Should revert if non-owner attempts to update the base token URI", async function () {
			await nftFactory.createNFT("Name", "Symbol", "Description", "Platform", "BaseURI")

			await expect(nftFactory.connect(addr1).updateNFTBaseTokenURI(0, "newBaseURI")).to.be.reverted
		})
	})
})
