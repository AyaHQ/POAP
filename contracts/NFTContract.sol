// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract NFTContract is ERC721Enumerable, Ownable {
	string public baseTokenURI;

	bool public paused = false;

	mapping(uint256 => mapping(address => bool)) private _whitelist;

	mapping(address => string) public ayaIds;

	mapping(address => string) public platformIds;

	mapping(address => bool) private hasMinted;

	// Optional: events for minting and URI update
	event BaseTokenURIUpdated(string indexed newBaseTokenURI);
	event TokenMinted(address indexed to, uint256 indexed tokenId);
	event PausedState(bool paused);

	constructor(
		string memory _name,
		string memory _symbol,
		string memory _baseTokenURI
	) ERC721(_name, _symbol) Ownable(msg.sender) {
		baseTokenURI = _baseTokenURI;
	}

	modifier onlyWhitelisted(uint256 group) {
		require(_whitelist[group][msg.sender], "Sender is not whitelisted");
		_;
	}

	modifier minted() {
		require(!hasMinted[msg.sender], "Address has minted a token");
		_;
	}

	modifier mintable() {
		require(paused == false, "Miniting is currrently paused");
		_;
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
			bytes(baseTokenURI).length > 0
				? string(
					abi.encodePacked(baseTokenURI, Strings.toString(tokenId))
				)
				: "";
	}

	function isWhitelisted(
		uint256 group,
		address _address
	) public view returns (bool) {
		return _whitelist[group][_address];
	}

	function whitelist(uint256 group, address _address) external onlyOwner {
		_whitelist[group][_address] = true;
	}

	function batchWhitelist(
		uint256 group,
		address[] memory _addresses
	) external onlyOwner {
		for (uint256 i = 0; i < _addresses.length; i++) {
			_whitelist[group][_addresses[i]] = true;
		}
	}

	function blacklist(uint256 group, address _address) external onlyOwner {
		_whitelist[group][_address] = false;
	}

	function mint(
		uint256 group,
		string memory ayaId,
		string memory platformId
	) external onlyWhitelisted(group) mintable minted {
		uint256 tokenId = totalSupply() + 1;
		address recipient = msg.sender;
		require(!_exists(tokenId), "Token already minted");

		_safeMint(recipient, tokenId);
		hasMinted[recipient] = true;

		ayaIds[recipient] = ayaId;
		platformIds[recipient] = platformId;

		emit TokenMinted(recipient, tokenId);
	}

	function mintFor(
		string memory ayaId,
		string memory platformId,
		address _address
	) external mintable onlyOwner {
		uint256 tokenId = totalSupply() + 1;
		address recipient = _address;

		_safeMint(recipient, tokenId);

		ayaIds[recipient] = ayaId;
		platformIds[recipient] = platformId;

		emit TokenMinted(recipient, tokenId);
	}

	function setBaseTokenURI(string memory newBaseTokenURI) external onlyOwner {
		baseTokenURI = newBaseTokenURI;
		emit BaseTokenURIUpdated(newBaseTokenURI);
	}

	function setPaused(bool _paused) external onlyOwner {
		paused = _paused;
		emit PausedState(_paused);
	}
}
