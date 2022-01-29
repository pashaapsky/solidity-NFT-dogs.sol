const {ethers, deployments, getChainId} = require("hardhat");
const PINATA_NFT_URIs = require("../metadata/rinkeby/pinata/nftUris.json");
const {getImageName} = require("./helpers");
const TESTNET_OPENSEA_URL = "https://testnets.opensea.io/assets";

async function main() {
    if (await getChainId() === "1337") {
        console.log("localhost: use fixture");
        await deployments.fixture(["main", 'mocks']);
    }

    const AdvancedCollectible = await deployments.get("AdvancedCollectible");
    const advancedCollectible = await ethers.getContractAt("AdvancedCollectible", AdvancedCollectible.address);
    console.log('advancedCollectible: ', advancedCollectible.address);

    const numberOfNFTs = await advancedCollectible.tokenCounter();
    console.log(`You have created: ${numberOfNFTs} NFTs!`);

    for (let tokenId = 0; tokenId < numberOfNFTs; tokenId++) {
        const tokenURI = await advancedCollectible.tokenURI(tokenId);

        if (!tokenURI) {
            console.log(`Created tokenURI for tokenId #${tokenId}...`);
            const tokenImage = getImageName(await advancedCollectible.tokenIdToImage(tokenId))
            const formattedImageKey = `${tokenId}-${tokenImage.toLowerCase()}`;

            await advancedCollectible.setTokenURI(tokenId, PINATA_NFT_URIs[formattedImageKey]);
            console.log(`You can see your NFT at ${TESTNET_OPENSEA_URL}/${advancedCollectible.address}/${tokenId}`)
        } else {
            console.log(`Token id #${tokenId} already has tokenURI => skipped...`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });