const {expect} = require("chai");
const {ethers, getChainId, deployments, network, config} = require("hardhat");

describe("Integration test:", () => {
    before(async () => {

    });

    it("TEST", async () => {
        if (await getChainId() === "1337") {
            this.skip();
        }
    });
});
