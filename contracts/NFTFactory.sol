// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { NFTContract } from "./NFTContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTFactory is Ownable {
	struct NFT {
		string description;
		string platform;
		address contractAddress;
	}

	mapping(uint256 => NFT) public nfts;

	uint256 public count;

	event NFTCreated(
		address indexed contractAddress,
		string platform,
		uint256 index
	);

	constructor() Ownable(msg.sender) {}

	function createNFT(
		string memory name,
		string memory symbol,
		string memory description,
		string memory platform,
		string memory tokenBaseURI,
		address owner
	) external onlyOwner {
		NFTContract nft = new NFTContract(name, symbol, tokenBaseURI, owner);

		address contractAddress = address(nft);

		nfts[count] = NFT(description, platform, contractAddress);

		emit NFTCreated(contractAddress, platform, count);

		count++;
	}

	function fetchNFTs() external view returns (NFT[] memory) {
		NFT[] memory _nfts = new NFT[](count);

		for (uint256 i = 0; i < count; i++) {
			_nfts[i] = nfts[i];
		}
		return _nfts;
	}
}
