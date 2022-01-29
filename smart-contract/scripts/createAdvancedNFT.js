const {ethers, deployments, getChainId, network, config} = require("hardhat");

async function main() {
    let linkToken;
    let fundAmount;

    if (await getChainId() === "1337") {
        console.log("localhost: use fixture");
        await deployments.fixture(["main", 'mocks']);
        const LinkToken = await deployments.get("LinkToken");
        linkToken = await ethers.getContractAt("LinkToken", LinkToken.address);
        console.log('Using mocked linkToken: ', linkToken.address);
        fundAmount = ethers.utils.parseUnits("2", "ether");
    } else {
        linkToken = await ethers.getContractAt("LinkToken", config.networks[network.name].linkToken);
        fundAmount = ethers.utils.parseUnits("0.1", "ether");
        console.log('Using testnet linkToken: ', linkToken.address);
    }

    const AdvancedCollectible = await deployments.get("AdvancedCollectible");
    const advancedCollectible = await ethers.getContractAt("AdvancedCollectible", AdvancedCollectible.address);
    console.log('advancedCollectible: ', advancedCollectible.address);

    console.log('fund contract start...');
    const fundTx = await linkToken.transfer(advancedCollectible.address, fundAmount);
    await fundTx.wait();
    console.log('ending fund!');
    console.log("start create NFT");
    const createTx = await advancedCollectible.createCollectible();
    createTx.wait();
    console.log("NFT Created!", createTx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

