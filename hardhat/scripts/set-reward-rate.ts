import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "baseSepolia",
    chainType: "l1",
});

const COIN_BATTLE = "0x68b817C0056B815e9280de759B33835CDabff6C4";

const ABI = [
    "function setRewardRate(uint256 _rate) external",
    "function rewardRate() external view returns (uint256)",
];

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const coinBattle = new ethers.Contract(COIN_BATTLE, ABI, deployer);

    const currentRate = await coinBattle.rewardRate();
    console.log("Current reward rate:", currentRate.toString());

    // USDC = 6 decimals, CBA = 18 decimals → 12 decimal gap
    // To give 1000 CBA per 1 USDC: rate = 1000 * 10^12 = 10^15
    const newRate = ethers.parseUnits("1000", 12); // 1000 * 1e12 = 1e15
    console.log("Setting new rate to:", newRate.toString(), "(= 1000 CBA per 1 USDC)");

    const tx = await coinBattle.setRewardRate(newRate);
    console.log("Tx hash:", tx.hash);
    await tx.wait();

    const updatedRate = await coinBattle.rewardRate();
    console.log("✅ Updated reward rate:", updatedRate.toString());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
