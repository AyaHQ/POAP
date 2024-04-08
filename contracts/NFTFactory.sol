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
		string memory tokenBaseURI
	) external onlyOwner {
		NFTContract nft = new NFTContract(name, symbol, tokenBaseURI);

		address contractAddress = address(nft);

		nfts[count] = NFT(description, platform, contractAddress);

		emit NFTCreated(contractAddress, platform, count);

		count++;
	}

	function setPaused(uint256 index, bool _paused) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.setPaused(_paused);
	}

	function whitelist(uint256 index, address _address) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.whitelist(_address);
	}

	function batchWhitelistNFTContract(
		uint256 index,
		address[] memory _addresses
	) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.batchWhitelist(_addresses);
	}

	function blacklist(uint256 index, address _address) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.blacklist(_address);
	}

	function updateNFTBaseTokenURI(
		uint256 index,
		string memory newBaseTokenURI
	) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.setBaseTokenURI(newBaseTokenURI);
	}

	// function totalMintedNFTContract(
	// 	uint256 index
	// ) public view returns (uint256) {
	// 	address contractAddress = nfts[index].contractAddress;
	// 	NFTContract nft = NFTContract(contractAddress);
	// 	return nft.totalSupply();
	// }
}
