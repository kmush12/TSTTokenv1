const hre = require("hardhat");

async function main() {
  const TostToken = await hre.ethers.getContractFactory("TostToken");
  const tostToken = await TostToken.deploy(1000000, 10);

  await tostToken.deployed();

  console.log("TostToken deployed: ", tostToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
