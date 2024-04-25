// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFTContract is ERC721Enumerable, Ownable {
	using Strings for uint256;

	mapping(address => bool) public _whitelist;
	mapping(address => bool) public hasMinted;
	mapping(address => string) public ayaIds;
	// mapping(address => string) public platformIds;

	bool public paused = false;
	string public _baseTokenURI;

	event Whitelisted(address indexed account);
	event Blacklisted(address indexed account);
	event Mint(address indexed to, uint256 indexed tokenId);
	event BaseTokenURIUpdated(string indexed newBaseTokenURI);
	event PausedState(bool paused);

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
		emit PausedState(_paused);
	}

	function setBaseTokenURI(string memory newBaseTokenURI) external onlyOwner {
		_baseTokenURI = newBaseTokenURI;
		emit BaseTokenURIUpdated(newBaseTokenURI);
	}

	function isWhitelisted(address _address) public view returns (bool) {
		return _whitelist[_address];
	}

	function whitelist(address _address) external onlyOwner {
		// check if whitelisted already
		require(!_whitelist[_address], "Address is already whitelisted");
		_whitelist[_address] = true;
		emit Whitelisted(_address);
	}

	function batchWhitelist(address[] memory _addresses) external onlyOwner {
		for (uint256 i = 0; i < _addresses.length; i++) {
			// require(
			// 	!_whitelist[_addresses[i]],
			// 	"One or more addresses are already whitelisted"
			// );
			_whitelist[_addresses[i]] = true;
			emit Whitelisted(_addresses[i]);
		}
	}

	function blacklist(address _address) external onlyOwner {
		require(
			_whitelist[_address],
			"Address is not whitelisted and cannot be blacklisted"
		);
		_whitelist[_address] = false;
		emit Blacklisted(_address);
	}

	function _exists(uint256 tokenId) internal view returns (bool) {
		return _ownerOf(tokenId) != address(0);
	}

	// Override function to return the URI forview a token
	function tokenURI(
		uint256 tokenId
	) public view override returns (string memory) {
		require(_exists(tokenId), "URI query for nonexistent token");

		return
			bytes(_baseTokenURI).length > 0
				? string(
					abi.encodePacked(_baseTokenURI, Strings.toString(tokenId))
				)
				: "";
	}

	function mint(
		string memory ayaId // string memory platformId
	) external {
		address recipient = msg.sender;
		require(!paused, "Minting is paused");
		require(_whitelist[recipient], "You are not whitelisted to mint");
		require(!hasMinted[recipient], "Address has minted a token");
		uint256 tokenId = totalSupply() + 1;
		require(!_exists(tokenId), "Token already minted");
		_safeMint(recipient, tokenId);
		hasMinted[recipient] = true;
		ayaIds[recipient] = ayaId;
		// platformIds[recipient] = platformId;
		emit Mint(recipient, tokenId);
	}

	function mintFor(
		string memory ayaId,
		// string memory platformId,
		address _address
	) external onlyOwner {
		require(!paused, "Minting is paused");
		require(_whitelist[_address], "You are not whitelisted to mint");
		require(!hasMinted[_address], "Address has minted a token");
		uint256 tokenId = totalSupply() + 1;

		_safeMint(_address, tokenId);
		ayaIds[_address] = ayaId;
		// platformIds[_address] = platformId;

		emit Mint(_address, tokenId);
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
