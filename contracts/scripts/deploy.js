const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const ngoWallet = process.env.NGO_WALLET;
  const adminWallet = process.env.ADMIN_WALLET || deployer.address;
  const targetAmount = process.env.TARGET_AMOUNT || "1";

  if (!ngoWallet) {
    throw new Error("Missing NGO_WALLET environment variable");
  }

  const targetWei = hre.ethers.parseEther(targetAmount);
  const Escrow = await hre.ethers.getContractFactory("DeReFundEscrow");
  const escrow = await Escrow.deploy(ngoWallet, targetWei, adminWallet);

  await escrow.waitForDeployment();

  console.log("DeReFundEscrow deployed");
  console.log("Contract:", await escrow.getAddress());
  console.log("Deployer:", deployer.address);
  console.log("Admin:", adminWallet);
  console.log("NGO wallet:", ngoWallet);
  console.log("Target:", targetAmount);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
