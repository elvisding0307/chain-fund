import { expect } from "chai";
import { ethers } from "hardhat";
import { CrowdfundingFactory, Crowdfunding } from "../typechain-types";

describe("CrowdfundingFactory", function () {
  let crowdfundingFactory: CrowdfundingFactory;
  let owner: any, addr1: any, addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const CrowdfundingFactory = await ethers.getContractFactory("CrowdfundingFactory");
    crowdfundingFactory = await CrowdfundingFactory.deploy();
    await crowdfundingFactory.waitForDeployment();
  });

  it("Should create a new project", async function () {
    const tx = await crowdfundingFactory.createProject(
      "Test Project",
      "Test Description",
      1, // 1 ETH target amount
      10, // 10 days duration
      100 // 100 max participants
    );
    await tx.wait();

    const projects = await crowdfundingFactory.getAllProjects();
    expect(projects.length).to.equal(1);
  });

  it("Should track projects by owner", async function () {
    await crowdfundingFactory.connect(addr1).createProject(
      "Project 1",
      "Description 1",
      1,
      10,
      100
    );

    await crowdfundingFactory.connect(addr1).createProject(
      "Project 2",
      "Description 2",
      2,
      15,
      50
    );

    const addr1Projects = await crowdfundingFactory.getProjectsByOwner(addr1.address);
    expect(addr1Projects.length).to.equal(2);
  });

  it("Should validate input parameters", async function () {
    await expect(
      crowdfundingFactory.createProject("", "Description", 1, 10, 100)
    ).to.be.revertedWith("Project name cannot be empty");

    await expect(
      crowdfundingFactory.createProject("Name", "", 1, 10, 100)
    ).to.be.revertedWith("Project description cannot be empty");

    await expect(
      crowdfundingFactory.createProject("Name", "Description", 0, 10, 100)
    ).to.be.revertedWith("Target amount must be greater than 0");
  });
});

describe("Crowdfunding", function () {
  let crowdfunding: Crowdfunding;
  let owner: any, addr1: any, addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
    crowdfunding = await Crowdfunding.deploy(
      "Test Project",
      "Test Description",
      1, // 1 ETH target amount
      10, // 10 days duration
      100 // 100 max participants
    );
    await crowdfunding.waitForDeployment();
  });

  it("Should allow a user to fund", async function () {
    const fundAmount = ethers.parseEther("0.1");
    const tx = await crowdfunding.connect(addr1).fund({ value: fundAmount });
    await tx.wait();

    const fundAmountStored = await crowdfunding.getFundAmount(addr1.address);
    expect(fundAmountStored).to.equal(fundAmount);

    const currentAmount = await crowdfunding.currentAmount();
    expect(currentAmount).to.equal(fundAmount);
  });

  it("Should prevent double funding from same address", async function () {
    await crowdfunding.connect(addr1).fund({ value: ethers.parseEther("0.1") });
    
    await expect(
      crowdfunding.connect(addr1).fund({ value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("You have already funded!");
  });

  it("Should allow owner to withdraw after end time", async function () {
    // Fund the project
    await crowdfunding.connect(addr1).fund({ value: ethers.parseEther("0.5") });
    
    // Fast forward time by 11 days
    await ethers.provider.send("evm_increaseTime", [11 * 24 * 60 * 60]);
    await ethers.provider.send("evm_mine", []);
    
    const initialBalance = await ethers.provider.getBalance(owner.address);
    const tx = await crowdfunding.withdrawMoney();
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
    
    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.gt(initialBalance - gasUsed);
  });

  it("Should return correct project information", async function () {
    const info = await crowdfunding.getAllInformation();
    expect(info[0]).to.equal("Test Project");
    expect(info[1]).to.equal("Test Description");
    expect(info[2]).to.equal(ethers.parseEther("1")); // target amount
    expect(info[7]).to.equal(owner.address); // owner
    expect(info[8]).to.be.true; // is active
  });
});