const {ethers} = require("hardhat");

module.exports = async ({getNamedAccounts, deployments, getChainId}) => {
    const {deploy} = deployments;
    const [owner] = await ethers.getSigners();

    await deploy("SimpleCollectible", {
        from: owner.address,
        log: true,
        args: [],
    });
};

module.exports.tags = ["all", "main"];