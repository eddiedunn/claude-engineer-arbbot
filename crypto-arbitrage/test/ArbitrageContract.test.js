const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ArbitrageContract", function () {
  let ArbitrageContract;
  let arbitrageContract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    ArbitrageContract = await ethers.getContractFactory("ArbitrageContract");
    [owner, addr1, addr2] = await ethers.getSigners();
    arbitrageContract = await ArbitrageContract.deploy();
    await arbitrageContract.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await arbitrageContract.owner()).to.equal(owner.address);
    });
  });

  describe("executeArbitrage", function () {
    it("Should emit ArbitrageExecuted event when called by owner", async function () {
      const path = [addr1.address, addr2.address];
      const amount = ethers.utils.parseEther("1");
      const minReturn = ethers.utils.parseEther("0.5");

      await expect(arbitrageContract.executeArbitrage(path, amount, minReturn))
        .to.emit(arbitrageContract, "ArbitrageExecuted")
        .withArgs(path[0], 0); // Currently 0 profit as it's a placeholder
    });

    it("Should revert when called by non-owner", async function () {
      const path = [addr1.address, addr2.address];
      const amount = ethers.utils.parseEther("1");
      const minReturn = ethers.utils.parseEther("0.5");

      await expect(
        arbitrageContract.connect(addr1).executeArbitrage(path, amount, minReturn)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  // Add more tests for withdrawToken and withdrawETH functions
});