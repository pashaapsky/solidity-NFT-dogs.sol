const { ethers, deployments } = require("hardhat");

const MY_TOKEN_URI = "https://ipfs.io/ipfs/QmTsAwfzJLgyPQfm69W7QjH8JZegpmvB2rWkVrDrM3N84M?filename=0-PUG.json";
const TESTNET_OPENSEA_URL = "https://testnets.opensea.io/assets";

async function main() {
    await deployments.fixture(["main"]);
    const SimpleCollectible = await deployments.get("SimpleCollectible");
    const simpleCollectible = await ethers.getContractAt("SimpleCollectible", SimpleCollectible.address);

    const tx = await simpleCollectible.createCollectible(MY_TOKEN_URI);
    await tx.wait();

    console.log(`You can see your NFT at ${TESTNET_OPENSEA_URL}/${simpleCollectible.address}/${await simpleCollectible.tokenCounter() - 1}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

