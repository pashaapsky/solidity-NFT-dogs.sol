const {expect} = require("chai");
const {ethers, getChainId, deployments} = require("hardhat");

describe("Unit tests:", () => {
    before(async () => {
        await deployments.fixture(["main"]);
    });

    it("TEST", async () => {
        if (await getChainId() !== "1337") {
            this.skip();
        }
    });
});
