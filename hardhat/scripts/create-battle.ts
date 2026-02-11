import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "baseSepolia",
    chainType: "l1",
});

// CoinBattle contract address from networkConfig
const COIN_BATTLE = "0xeEB323B5ba1001453aeFf3f28623D8832A82e146";

// CoinBattle ABI (only what we need)
const COIN_BATTLE_ABI = [
    "function createBattle(string calldata _coinA, string calldata _coinB, uint256 _duration) external returns (uint256)",
    "function battleCount() external view returns (uint256)",
    "function getBattle(uint256 _battleId) external view returns (tuple(string coinA, string coinB, uint256 endTime, uint256 totalPoolA, uint256 totalPoolB, uint8 winner, uint8 status))",
    "function owner() external view returns (address)",
];

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const coinBattle = new ethers.Contract(COIN_BATTLE, COIN_BATTLE_ABI, deployer);

    // Check owner
    const owner = await coinBattle.owner();
    console.log("Contract owner:", owner);
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
        console.error("ERROR: Deployer is not the contract owner. Only the owner can create battles.");
        process.exit(1);
    }

    // Check current battle count
    const currentCount = await coinBattle.battleCount();
    console.log("Current battle count:", currentCount.toString());

    // Create battle #0: 24h duration (86400 seconds)
    const coinA = "PEPE";
    const coinB = "WIF";
    const duration = 86400; // 24 hours
    console.log(`\nCreating battle: ${coinA} vs ${coinB} (${duration}s / 24h)...`);

    const tx = await coinBattle.createBattle(coinA, coinB, duration);
    console.log("Tx hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Battle created! Block:", receipt.blockNumber);

    // Verify
    const newCount = await coinBattle.battleCount();
    console.log("New battle count:", newCount.toString());

    const battle = await coinBattle.getBattle(newCount - 1n);
    console.log("\nBattle details:");
    console.log("  Coin A:", battle.coinA);
    console.log("  Coin B:", battle.coinB);
    console.log("  End time:", new Date(Number(battle.endTime) * 1000).toISOString());
    console.log("  Status:", battle.status === 0 ? "Open" : battle.status === 1 ? "Resolved" : "Cancelled");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
