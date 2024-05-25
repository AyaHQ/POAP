// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTContract is ERC721Enumerable, Ownable, ReentrancyGuard {
	using Strings for uint256;

	mapping(address => bool) public _whitelist;
	mapping(address => bool) public hasMinted;
	mapping(address => string) public ayaIds;
	// mapping(address => string) public platformIds;

	bool public paused = false;
	string public _baseTokenURI;

	event WhitelistUpdated(address indexed account, bool isWhitelisted);
	event TokenMinted(
		address indexed to,
		uint256 indexed tokenId,
		string ayaId
	);
	event BaseTokenURIChanged(string newBaseTokenURI);
	event ContractPaused(bool isPaused);

	constructor(
		string memory name,
		string memory symbol,
		string memory baseTokenURI,
		address owner
	) ERC721(name, symbol) Ownable(owner) {
		_baseTokenURI = baseTokenURI;
	}

	function setPaused(bool _paused) external onlyOwner {
		paused = _paused;
		emit ContractPaused(_paused);
	}

	function setBaseTokenURI(string memory newBaseTokenURI) external onlyOwner {
		_baseTokenURI = newBaseTokenURI;
		emit BaseTokenURIChanged(newBaseTokenURI);
	}

	function isWhitelisted(address _address) public view returns (bool) {
		return _whitelist[_address];
	}

	function whitelist(address _address) external onlyOwner {
		require(!_whitelist[_address], "Address is already whitelisted");
		_whitelist[_address] = true;
		emit WhitelistUpdated(_address, true);
	}

	function batchWhitelist(address[] memory _addresses) external onlyOwner {
		for (uint256 i = 0; i < _addresses.length; i++) {
			_whitelist[_addresses[i]] = true;
			emit WhitelistUpdated(_addresses[i], true);
		}
	}

	function blacklist(address _address) external onlyOwner {
		require(_whitelist[_address], "Address is not whitelisted");
		_whitelist[_address] = false;
		emit WhitelistUpdated(_address, false);
	}

	function _exists(uint256 tokenId) internal view returns (bool) {
		return _ownerOf(tokenId) != address(0);
	}

	function tokenURI(
		uint256 tokenId
	) public view override returns (string memory) {
		require(_exists(tokenId), "URI query for nonexistent token");

		return
			bytes(_baseTokenURI).length > 0
				? string(abi.encodePacked(_baseTokenURI, tokenId.toString()))
				: "";
	}

	function mint(string memory ayaId) external nonReentrant {
		address recipient = msg.sender;
		require(!paused, "Minting is paused");
		require(_whitelist[recipient], "Not whitelisted to mint");
		require(!hasMinted[recipient], "Token already minted");
		uint256 tokenId = totalSupply() + 1;
		require(!_exists(tokenId), "Token ID exists");
		_safeMint(recipient, tokenId);
		hasMinted[recipient] = true;
		ayaIds[recipient] = ayaId;
		emit TokenMinted(recipient, tokenId, ayaId);
	}

	function mintFor(
		string memory ayaId,
		address _address
	) external onlyOwner nonReentrant {
		require(!paused, "Minting is paused");
		require(_whitelist[_address], "Not whitelisted to mint");
		require(!hasMinted[_address], "Token already minted");
		uint256 tokenId = totalSupply() + 1;
		_safeMint(_address, tokenId);
		hasMinted[_address] = true;
		ayaIds[_address] = ayaId;
		emit TokenMinted(_address, tokenId, ayaId);
	}

	function _update(
		address to,
		uint256 tokenId,
		address auth
	) internal override(ERC721Enumerable) returns (address) {
		address from = _ownerOf(tokenId);
		if (from != address(0) && to != address(0)) {
			revert("Soulbound: Transfer failed");
		}
		return super._update(to, tokenId, auth);
	}
}
