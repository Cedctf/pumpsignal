import React from 'react';
import { ScoredCurve } from '../../lib/scoring';
import TokenAvatar from '../TokenAvatar';

// ── Formatters ───────────────────────────────────────────

const formatPrice = (priceUsd: string): string => {
    const val = Number(priceUsd) * 1_000_000_000; // price × 1B supply
    if (val === 0) return '$0.00';
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
    if (val >= 1) return `$${val.toFixed(2)}`;
    return `$${val.toFixed(4)}`;
};

const formatMc = (mc: number): string => {
    if (mc >= 1_000_000_000) return `$${(mc / 1_000_000_000).toFixed(2)}B`;
    if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(2)}M`;
    if (mc >= 1_000) return `$${(mc / 1_000).toFixed(2)}K`;
    return `$${mc.toFixed(2)}`;
};

const formatVolume = (vol: number): string => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K ETH`;
    if (vol >= 1) return `${vol.toFixed(2)} ETH`;
    return `${vol.toFixed(4)} ETH`;
};

const formatVelocity = (vel: number): string => {
    return `${vel.toFixed(1)}/hr`;
};

// ── Tier & Score Visuals ─────────────────────────────────

const tierConfig = {
    hot: { label: '🔥 Hot', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
    rising: { label: '📈 Rising', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    active: { label: '⚡ Active', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    dead: { label: '💀 Dead', color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/30' },
};

const getScoreColor = (score: number): string => {
    if (score >= 0.7) return 'text-orange-400';
    if (score >= 0.4) return 'text-green-400';
    if (score >= 0.2) return 'text-blue-400';
    return 'text-zinc-500';
};

const getAvatarColor = (id: string): string => {
    const colors = ['4ADE80', 'FCD34D', 'EA580C', '3B82F6', '8B5CF6', 'EC4899', '14B8A6', 'F97316', '6366F1', 'EF4444'];
    const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

// ── Component ────────────────────────────────────────────

interface LeaderboardTableProps {
    curves: ScoredCurve[];
    isLoading?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ curves, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full py-20 text-center text-zinc-500 text-lg">
                Loading leaderboard data...
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
                <thead>
                    <tr className="text-zinc-500 text-sm border-b border-zinc-800">
                        <th className="py-4 text-left font-medium pl-4 w-16">Rank</th>
                        <th className="py-4 text-left font-medium">Coin</th>
                        <th className="py-4 text-right font-medium">Price</th>
                        <th className="py-4 text-right font-medium">Market Cap</th>
                        <th className="py-4 text-right font-medium">Volume</th>
                        <th className="py-4 text-right font-medium">Velocity</th>
                        <th className="py-4 text-right font-medium">Trades</th>
                        <th className="py-4 text-center font-medium">Tier</th>
                        <th className="py-4 text-right font-medium pr-4">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {curves.map((coin, index) => {
                        const rank = index + 1;
                        const tier = tierConfig[coin.tier];

                        return (
                            <tr key={coin.id} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors group">
                                {/* Rank */}
                                <td className="py-6 pl-4">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${rank === 1
                                            ? 'bg-yellow-500 text-black'
                                            : rank === 2
                                                ? 'bg-zinc-300 text-black'
                                                : rank === 3
                                                    ? 'bg-orange-600 text-white'
                                                    : 'text-zinc-400 bg-zinc-800/50'
                                            }`}
                                    >
                                        {rank}
                                    </div>
                                </td>

                                {/* Coin Info */}
                                <td className="py-6">
                                    <div className="flex items-center gap-4">
                                        <TokenAvatar
                                            uri={coin.uri}
                                            name={coin.name}
                                            symbol={coin.symbol}
                                            size={40}
                                            className="rounded-full border border-zinc-700"
                                        />
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-zinc-200">{coin.name}</span>
                                                <span className="text-xs text-zinc-500 font-bold">{coin.symbol}</span>
                                            </div>
                                            <div className="flex gap-2 mt-1">
                                                {coin.graduated && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded border bg-green-500/10 text-green-400 border-green-500/30">
                                                        Graduated
                                                    </span>
                                                )}
                                                <span className="text-[10px] px-1.5 py-0.5 rounded border bg-zinc-800 text-zinc-400 border-zinc-700 font-mono">
                                                    {coin.creator.slice(-6)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Price */}
                                <td className="py-6 text-right font-medium text-zinc-300">
                                    {formatPrice(coin.lastPriceUsd)}
                                </td>

                                {/* Market Cap */}
                                <td className="py-6 text-right font-medium text-zinc-300">
                                    {formatMc(coin.estimatedMcUsd)}
                                </td>

                                {/* Volume */}
                                <td className="py-6 text-right font-medium text-zinc-400">
                                    {formatVolume(coin.volumeEth)}
                                </td>

                                {/* Velocity */}
                                <td className="py-6 text-right font-medium text-zinc-400">
                                    {formatVelocity(coin.velocity)}
                                </td>

                                {/* Trades */}
                                <td className="py-6 text-right font-medium text-zinc-400">
                                    {coin.trades.toLocaleString()}
                                </td>

                                {/* Tier */}
                                <td className="py-6 text-center">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${tier.bg} ${tier.color} font-medium whitespace-nowrap`}>
                                        {tier.label}
                                    </span>
                                </td>

                                {/* Score */}
                                <td className={`py-6 text-right font-bold pr-4 ${getScoreColor(coin.score)}`}>
                                    {(coin.score * 100).toFixed(0)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default LeaderboardTable;
