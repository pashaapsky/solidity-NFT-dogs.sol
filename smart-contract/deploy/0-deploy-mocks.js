const {ethers} = require("hardhat");

module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy, log} = deployments;
    const [owner] = await ethers.getSigners();

    if (await getChainId() === "1337") {
        log("Local Network Detected, Deploying Mocks");

        const LinkToken = await deploy("LinkToken", {
            from: owner.address,
            log: true,
            args: [],
        });

        await deploy("VRFCoordinator", {
            from: owner.address,
            log: true,
            args: [LinkToken.address],
        });
        log("Mocks deployed");
    } else {
        log("No need to deploy all Mocks in not Local Network");
    }
};

module.exports.tags = ["all", "mocks"];