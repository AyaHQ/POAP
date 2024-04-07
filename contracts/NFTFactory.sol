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

	function _getSigner(
		bytes32 _ethSignedMessageHash,
		bytes32 r,
		bytes32 s,
		uint8 v
	) internal pure returns (address) {
		return ecrecover(_ethSignedMessageHash, v, r, s);
	}

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

	// function mint(
	// 	bytes32 _ethSignedMessageHash,
	// 	bytes32 r,
	// 	bytes32 s,
	// 	uint8 v,
	// 	uint256 index,
	// 	uint256 group,
	// 	string memory ayaId,
	// 	string memory platformId
	// ) external onlyOwner {
	// 	address contractAddress = nfts[index].contractAddress;
	// 	NFTContract nft = NFTContract(contractAddress);

	// 	address _address = _getSigner(_ethSignedMessageHash, r, s, v);
	// 	require(
	// 		nft.isWhitelisted(group, _address),
	// 		"Address is not whitelisted"
	// 	);
	// 	nft.mintFor(ayaId, platformId, _address);
	// }

	function setPaused(uint256 index, bool _paused) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.setPaused(_paused);
	}

	function whitelist(
		uint256 index,
		uint256 group,
		address _address
	) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.whitelist(group, _address);
	}

	function batchWhitelistNFTContract(
		uint256 index,
		uint256 group,
		address[] memory _addresses
	) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.batchWhitelist(group, _addresses);
	}

	function blacklist(
		uint256 index,
		uint256 group,
		address _address
	) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.blacklist(group, _address);
	}

	function updateNFTBaseTokenURI(
		uint256 index,
		string memory newBaseTokenURI
	) external onlyOwner {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		nft.setBaseTokenURI(newBaseTokenURI);
	}

	function totalMintedNFTContract(
		uint256 index
	) public view returns (uint256) {
		address contractAddress = nfts[index].contractAddress;
		NFTContract nft = NFTContract(contractAddress);
		return nft.totalSupply();
	}
}
