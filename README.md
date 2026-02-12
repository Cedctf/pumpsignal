# 🥊 Pump Fight: The Liquidity Combat Layer

[![Network: Base](https://img.shields.io/badge/Network-Base-blue.svg)](https://base.org)
[![Platform: RobinPump](https://img.shields.io/badge/Protocol-RobinPump-green.svg)](https://robinpump.com)

> **Stop Trading. Start Fighting.** > Pump Fight is the world’s first liquidity orchestration layer that synchronizes capital through high-stakes competitive battles.

---

## 🌪️ The Problem: Liquidity Entropy
On RobinPump, capital is chaotic. Liquidity is fragmented across a thousand "shitcoins," leading to:
* **Asynchronous Decay:** Buying pressure is scattered, meaning bonding curves never reach escape velocity.
* **Attention Deficit:** Without a central focal point, communities dissolve within minutes.
* **Passive Speculation:** Users bet on outcomes rather than driving them.

## 🔥 The Solution: Pump Fight
Pump Fight transforms passive trading into a coordinated **Liquidity Event**. We introduce scheduled battles between tokens where the community's capital is weaponized to drive the curve.

### The "Split-Bet" Primitive
Every participation in a Pump Fight triggers a dual-atomic execution:
1. **50% Strike (Market Half):** Dispatched directly to the RobinPump bonding curve. This is immediate buy pressure.
2. **50% Stake (Pool Half):** Escrowed in the Pump Fight Battle Pool. This is the competitive "prize" at stake.

---

## ⚙️ Technical Architecture

### 1. The Battle Engine (`CoinBattle.sol`)
**Contract Address:** [`0x0FA69EaDa5b2211B9E217C5C63b639B3a58bD3c0`](https://sepolia.basescan.org/address/0x0fa69eada5b2211b9e217c5c63b639b3a58bd3c0)

Our smart contracts on **Base Sepolia** manage the betting logic and prize pools. The `CoinBattle` contract:
* **Escrows Stakes:** Holds wagered ETH/USDC during the battle.
* **Tracks Positions:** Records user bets on specific coin outcomes (Coin A vs Coin B).
* **Automated Payouts:** Distributes the total pot to the winning side's stakers upon battle resolution.

### 2. The Data Layer (Goldsky Indexer)
We utilize a custom **Goldsky Subgraph** to index real-time data from the Pump.fun bonding curves on Solana. This allows us to:
* **Fetch Curves:** Retrieve live token metrics (volume, market cap, creation time).
* **Score & Rank:** Our proprietary scoring engine (`scoring.ts`) normalizes velocity and volume to identify the hottest active tokens for battle pairing.

### 3. The Orchestration Layer (Frontend)
The Next.js frontend acts as the bridge between chains:
* **Visualization:** Displays real-time "Live Battles" with health bars driven by bonding curve progress.
* **Interaction:** Users connect their Base wallet to place bets while watching Solana market data, creating a seamless cross-chain experience.
* **Settlement Logic:** $\Delta\% = \frac{(P_{final} - P_{initial})}{P_{initial}}$. The token with the superior relative growth wins the round.

---

## 🛡️ Anti-Manipulation & Security
To prevent "whale-sniping" and price manipulation:
* **Time-Bound Windows:** Battles have strict entry and exit timestamps.
* **Wallet Caps:** Limits the maximum pool-influence per participant.
* **Non-Custodial:** Funds are held in audited escrow contracts, never by the platform.

---

## 🚀 Future Roadmap
- [ ] **Dynamic Multi-Battles:** 4-way "Royal Rumble" token fights.
- [ ] **Power-Ups:** Use specific NFTs to boost your "Pool Half" payout multiplier.
- [ ] **API for Launchpads:** Allowing other pump-style platforms to plug into the Fight Engine.

---

*Built for the degens. Powered by Base. Optimized for RobinPump.*
