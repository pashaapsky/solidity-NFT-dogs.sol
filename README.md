HOW IT`S WORKS:
1. Deploy contracts npx hardhat deploy --network rinkeby
2. Create one NFT with script /scripts/createAdvancedNFT.js
    - npx hardhat run scripts/createAdvancedNFT.js --network rinkeby
    !wait sometime when tokenCreated and tokenCounter update (1min - 3min~)
    !we`re waiting for VRFCoordinator get random number for randomize NFT image of dog.
3. Create metaData for created NFT with NFT`s tokenId with:
    - npx hardhat run scripts/pinata/createMetaDataWithPinata.js --network rinkeby
    or
    //start local IPFS
    - ipfs daemon  
    - npx hardhat run scripts/ipfs/createMetaDataWithIPFS.js --network rinkeby
4. SET TOKEN_URI for your created NFT with script /scripts/setTokenURI.js
    - npx hardhat run scripts/setTokenURI.js
    