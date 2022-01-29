const {ethers, config, network} = require("hardhat");

module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy, get} = deployments;
    const [owner] = await ethers.getSigners();

    let LinkToken;
    let VRFCoordinator;

    if (await getChainId() === "1337") {
        await deployments["mocks"];

        LinkToken = await deployments.get("LinkToken").then(res => res.address);
        VRFCoordinator = await deployments.get("VRFCoordinator").then(res => res.address);
    } else {
        LinkToken = config.networks[network.name].linkToken;
        VRFCoordinator = config.networks[network.name].vrfCoordinator;
    }

    const KeyHash = config.networks[network.name].keyHash;
    const Fee = config.networks[network.name].fee;

    await deploy("AdvancedCollectible", {
        from: owner.address,
        log: true,
        args: [VRFCoordinator, LinkToken, KeyHash, Fee],
    });
};

module.exports.tags = ["all", "main"];