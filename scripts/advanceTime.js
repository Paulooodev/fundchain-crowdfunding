const hre = require("hardhat");

async function main() {
    // Advance time by 2 days
    await hre.network.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]);
    await hre.network.provider.send("evm_mine");
    console.log("Time advanced by 7 days");
}

main().catch(console.error);