import { network } from "hardhat";

const { ethers } = await network.connect({
    network: "baseSepolia",
    chainType: "l1",
});

// Token addresses from networkConfig
const MOCK_USDC = "0x0565ea3C8b2700e0b35197dF0258eA3A177930B9";
const CBA = "0x9812E5fd8c1fFD85ea3e81724596c9025C80D171";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    // Deploy CoinBattle with USDC as betToken and CBA as rewardToken
    console.log("\nDeploying CoinBattle...");
    console.log("  betToken (USDC):", MOCK_USDC);
    console.log("  rewardToken (CBA):", CBA);

    const CoinBattle = await ethers.getContractFactory("CoinBattle");
    const coinBattle = await CoinBattle.deploy(MOCK_USDC, CBA);
    await coinBattle.waitForDeployment();
    const coinBattleAddress = await coinBattle.getAddress();

    console.log("\n✅ CoinBattle deployed to:", coinBattleAddress);
    console.log("\n--- Update networkConfig.ts ---");
    console.log(`COIN_BATTLE: '${coinBattleAddress}'`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
