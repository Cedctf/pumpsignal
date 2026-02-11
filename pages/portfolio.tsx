import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { networkConfig, COIN_BATTLE_ABI } from '@/lib/networkConfig';

const BATTLE_ADDRESS = networkConfig.baseSepolia.contracts.COIN_BATTLE as `0x${string}`;
const BATTLE_ID = 0;
const USDC_DECIMALS = 6;

export default function PortfolioPage() {
    const { address, isConnected } = useAccount();

    const { data: userBetData, isLoading } = useReadContract({
        address: BATTLE_ADDRESS,
        abi: COIN_BATTLE_ABI,
        functionName: 'getUserBet',
        args: address ? [BigInt(BATTLE_ID), address] : undefined,
        query: { enabled: !!address },
    });

    const userBet = userBetData as { side: number; amount: bigint; claimed: boolean } | undefined;

    const hasBet = userBet && userBet.amount > BigInt(0);
    const betAmount = hasBet ? parseFloat(formatUnits(userBet.amount, USDC_DECIMALS)) : 0;

    // Requested hardcoded payout multiplier
    const MULTIPLIER = 1.66;
    const potentialPayout = (betAmount * MULTIPLIER).toFixed(2);

    // Hardcoded for this specific request
    const marketName = "CBA vs ZERO";
    const sideName = hasBet ? (userBet.side === 1 ? "CBA" : "ZERO") : "-";

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
            <Head>
                <title>Portfolio | PumpFight</title>
            </Head>

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                    Your Portfolio
                </h1>

                {!isConnected ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                        <p className="text-zinc-400 mb-6">Connect your wallet to view your active bets</p>
                        <div className="flex justify-center">
                            <ConnectButton chainStatus="icon" accountStatus="avatar" showBalance={false} />
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-zinc-500 mt-4">Loading portfolio...</p>
                    </div>
                ) : !hasBet ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                        <p className="text-zinc-400 mb-4">No active bets found.</p>
                        <Link href="/battle?left=CBA&right=ZERO" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
                            Go to Battle Arena &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/30 transition-colors">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white">{marketName}</h2>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium uppercase tracking-wider">
                                        Active
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Your Side</p>
                                        <p className="text-lg font-bold text-white">{sideName}</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Bet Amount</p>
                                        <p className="text-lg font-bold text-white">{betAmount.toFixed(2)} USDC</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Multiplier</p>
                                        <p className="text-lg font-bold text-yellow-400">{MULTIPLIER}x</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Potential Payout</p>
                                        <p className="text-lg font-bold text-green-400">{potentialPayout} USDC</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-zinc-950/50 px-6 py-3 border-t border-zinc-800 flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Battle ID #{BATTLE_ID}</span>
                                <Link href="/battle?left=CBA&right=ZERO" className="text-emerald-400 hover:text-emerald-300 font-medium text-xs uppercase tracking-wider hover:underline">
                                    View Market &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
