//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract AdvancedCollectible is ERC721URIStorage, VRFConsumerBase {
    uint256 public tokenCounter;

    enum Images{PUG, SHIBA_INU, ST_BERNARD}

    //mappings
    mapping(bytes32 => address) public requestIdToSender;
    mapping(uint256 => Images) public tokenIdToImage;
    mapping(bytes32 => string) public requestIdToTokenURI;

    //BEST PRACTICE - создавать event на каждый mapping (+для тестов)
    event requestedCollectible(bytes32 indexed requestId, address requester);
    event imageAssigned(uint256 indexed tokenId, Images image);

    //VRFCoordinator stuff
    bytes32 public keyHash;
    uint256 public fee;

    constructor (address _vrfCoordinator, address _link, bytes32 _keyHash, uint256 _fee)
    VRFConsumerBase (_vrfCoordinator, _link)
    ERC721("Apsky Dogs", "DOG")
    {
        tokenCounter = 0;
        keyHash = _keyHash;
        fee = _fee;
    }

    //запрашивает рандомное число
    function createCollectible() public returns (bytes32) {
        bytes32 requestId = requestRandomness(keyHash, fee);
        requestIdToSender[requestId] = msg.sender;
        emit requestedCollectible(requestId, msg.sender);

        return requestId;
    }

    //результат приходит в эту функцию, она и выполняет функционал с рандомом
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        Images image = Images(randomness % 3);
        uint256 newTokenId = tokenCounter;
        //чтобы сделать MINT нам нужен sender, но функцию fulfillRandomness вызывает VRFCoordinator, но у нас есть requestId
        //=> создаем mapping requestIdToSender
        address owner = requestIdToSender[requestId];
        tokenIdToImage[newTokenId] = image;
        emit imageAssigned(newTokenId, image);
        string memory tokenURI = requestIdToTokenURI[requestId];
        _safeMint(owner, newTokenId);
        tokenCounter = tokenCounter + 1;
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not owner no approved");
        _setTokenURI(tokenId, _tokenURI);
    }
}
