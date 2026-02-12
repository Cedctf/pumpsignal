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

### 1. The Battle Engine (`BattlePool.sol`)
Our smart contracts on **Base** manage the escrow of the "Pool Half." The contract tracks positions by wallet and enforces the redistribution of the losing side's stake to the winners upon settlement.

### 2. The Orchestration Layer
The frontend coordinates two distinct blockchain interactions into a single user flow. By using Base’s low-fee environment, we make this dual-transaction model economically viable for retail participants.

### 3. The Oracle & Indexer
* **Snapshot A:** Prices recorded at `Battle_Start`.
* **Snapshot B:** Prices recorded at `Battle_End`.
* **Settlement Logic:** $\Delta\% = \frac{(P_{final} - P_{initial})}{P_{initial}}$. The token with the superior relative growth wins the pool.

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
