const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeReFundEscrow", function () {
  const targetAmount = ethers.parseEther("10");
  const firstMilestone = ethers.parseEther("4");
  const secondMilestone = ethers.parseEther("6");

  async function deployEscrow() {
    const [admin, ngo, donor, other] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("DeReFundEscrow");
    const escrow = await Escrow.deploy(ngo.address, targetAmount, admin.address);
    await escrow.waitForDeployment();

    return { escrow, admin, ngo, donor, other };
  }

  it("accepts donations and tracks donor balances", async function () {
    const { escrow, donor } = await deployEscrow();
    const amount = ethers.parseEther("2");

    await expect(escrow.connect(donor).donate({ value: amount }))
      .to.emit(escrow, "DonationReceived")
      .withArgs(donor.address, amount, amount);

    expect(await escrow.totalDonated()).to.equal(amount);
    expect(await escrow.donations(donor.address)).to.equal(amount);
  });

  it("does not allow donations after the campaign reaches the target", async function () {
    const { escrow, donor, other } = await deployEscrow();

    await escrow.connect(donor).donate({ value: targetAmount });

    await expect(
      escrow.connect(other).donate({ value: ethers.parseEther("0.1") })
    ).to.be.revertedWith("Campaign already fully funded");
  });

  it("does not allow a donation that exceeds the remaining target", async function () {
    const { escrow, donor, other } = await deployEscrow();

    await escrow.connect(donor).donate({ value: ethers.parseEther("9.5") });

    await expect(
      escrow.connect(other).donate({ value: ethers.parseEther("0.6") })
    ).to.be.revertedWith("Donation exceeds remaining target");
  });

  it("lets admin add milestones up to the campaign target", async function () {
    const { escrow } = await deployEscrow();

    await expect(escrow.addMilestone("Food packages", firstMilestone))
      .to.emit(escrow, "MilestoneAdded")
      .withArgs(0, "Food packages", firstMilestone);
    await escrow.addMilestone("Temporary shelters", secondMilestone);

    expect(await escrow.milestoneCount()).to.equal(2);
    await expect(escrow.addMilestone("Too much", 1)).to.be.revertedWith("Milestones exceed target");
  });

  it("does not allow non-NGO accounts to submit milestone proof", async function () {
    const { escrow, donor } = await deployEscrow();
    await escrow.addMilestone("Food packages", firstMilestone);

    await expect(
      escrow.connect(donor).submitProof(0, "ipfs://food-proof")
    ).to.be.revertedWith("Only NGO wallet");
  });

  it("releases milestone funds only after proof and admin approval", async function () {
    const { escrow, ngo, donor } = await deployEscrow();
    await escrow.addMilestone("Food packages", firstMilestone);
    await escrow.connect(donor).donate({ value: targetAmount });

    await expect(escrow.approveAndRelease(0)).to.be.revertedWith("Proof not submitted");
    await escrow.connect(ngo).submitProof(0, "ipfs://food-proof");

    await expect(() => escrow.approveAndRelease(0)).to.changeEtherBalances(
      [escrow, ngo],
      [-firstMilestone, firstMilestone]
    );

    const milestone = await escrow.getMilestone(0);
    expect(milestone.proofSubmitted).to.equal(true);
    expect(milestone.approved).to.equal(true);
    expect(milestone.released).to.equal(true);
    expect(await escrow.totalReleased()).to.equal(firstMilestone);
  });

  it("prevents releasing the same milestone twice", async function () {
    const { escrow, ngo, donor } = await deployEscrow();
    await escrow.addMilestone("Food packages", firstMilestone);
    await escrow.connect(donor).donate({ value: targetAmount });
    await escrow.connect(ngo).submitProof(0, "ipfs://food-proof");
    await escrow.approveAndRelease(0);

    await expect(escrow.approveAndRelease(0)).to.be.revertedWith("Milestone already released");
  });

  it("marks the campaign completed after all target milestones are released", async function () {
    const { escrow, ngo, donor } = await deployEscrow();
    await escrow.addMilestone("Food packages", firstMilestone);
    await escrow.addMilestone("Shelter setup", secondMilestone);
    await escrow.connect(donor).donate({ value: targetAmount });

    await escrow.connect(ngo).submitProof(0, "ipfs://food-proof");
    await escrow.approveAndRelease(0);
    await escrow.connect(ngo).submitProof(1, "ipfs://shelter-proof");

    await expect(escrow.approveAndRelease(1)).to.emit(escrow, "CampaignCompleted");
    expect(await escrow.status()).to.equal(2);
  });

  it("allows refunds after cancellation if no funds were released", async function () {
    const { escrow, donor } = await deployEscrow();
    const amount = ethers.parseEther("2");

    await escrow.connect(donor).donate({ value: amount });
    await escrow.cancelCampaign();

    await expect(() => escrow.connect(donor).claimRefund()).to.changeEtherBalances(
      [escrow, donor],
      [-amount, amount]
    );
  });

  it("does not allow cancellation after a milestone release", async function () {
    const { escrow, ngo, donor } = await deployEscrow();
    await escrow.addMilestone("Food packages", firstMilestone);
    await escrow.connect(donor).donate({ value: targetAmount });
    await escrow.connect(ngo).submitProof(0, "ipfs://food-proof");
    await escrow.approveAndRelease(0);

    await expect(escrow.cancelCampaign()).to.be.revertedWith("Cannot cancel after releases");
  });

  it("blocks donations while paused", async function () {
    const { escrow, donor } = await deployEscrow();

    await escrow.pause();
    await expect(
      escrow.connect(donor).donate({ value: ethers.parseEther("1") })
    ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
  });
});
