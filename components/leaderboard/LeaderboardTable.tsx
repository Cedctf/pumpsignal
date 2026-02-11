import React from 'react';
import { ScoredCurve } from '../../lib/scoring';
import TokenAvatar from '../TokenAvatar';
import {
    Trophy,
    Flame,
    BarChart3,
    TrendingUp,
    Activity,
    ArrowUpRight
} from 'lucide-react';

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
    hot: { label: 'HOT', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    rising: { label: 'RISING', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    active: { label: 'ACTIVE', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    dead: { label: 'DEAD', color: 'text-zinc-600', bg: 'bg-zinc-800/50 border-zinc-800' },
};

const getScoreColor = (score: number): string => {
    if (score >= 0.7) return 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.3)]';
    if (score >= 0.4) return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]';
    if (score >= 0.2) return 'text-blue-400';
    return 'text-zinc-600';
};

// ── Component ────────────────────────────────────────────

interface LeaderboardTableProps {
    curves: ScoredCurve[];
    isLoading?: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ curves, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full py-32 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                <div className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Syncing Blockchain Data...</div>
            </div>
        );
    }

    if (curves.length === 0) {
        return (
            <div className="w-full py-32 text-center flex flex-col items-center justify-center gap-4 text-zinc-500">
                <Activity className="w-12 h-12 stroke-[1.5] opacity-20" />
                <div className="text-sm font-mono tracking-widest uppercase">No active pairs found</div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                    <tr className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold border-b border-zinc-800/50">
                        <th className="py-6 pl-8 w-20">Rank</th>
                        <th className="py-6">Gladiator</th>
                        <th className="py-6 text-right">Price</th>
                        <th className="py-6 text-right">Mkt Cap</th>
                        <th className="py-6 text-right">Volume</th>
                        <th className="py-6 text-right">Velocity</th>
                        <th className="py-6 text-right">Trades</th>
                        <th className="py-6 text-center">Status</th>
                        <th className="py-6 text-right pr-8">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {curves.map((coin, index) => {
                        const rank = index + 1;
                        const tier = tierConfig[coin.tier];

                        return (
                            <tr key={coin.id} className="border-b border-zinc-800/50 hover:bg-emerald-500/5 transition-colors group">
                                {/* Rank */}
                                <td className="py-4 pl-8">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm ${rank === 1
                                            ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                                            : rank === 2
                                                ? 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-black shadow-[0_0_15px_rgba(212,212,216,0.2)]'
                                                : rank === 3
                                                    ? 'bg-gradient-to-br from-orange-400 to-orange-700 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                                                    : 'text-zinc-500 font-mono bg-zinc-900 border border-zinc-800'
                                            }`}
                                    >
                                        {rank}
                                    </div>
                                </td>

                                {/* Coin Info */}
                                <td className="py-4">
                                    <div className="flex items-center gap-4">
                                        <TokenAvatar
                                            uri={coin.uri}
                                            name={coin.name}
                                            symbol={coin.symbol}
                                            size={44}
                                            className="rounded-xl border border-zinc-800 group-hover:border-emerald-500/30 transition-colors shadow-lg"
                                        />
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{coin.name}</span>
                                                <span className="text-[10px] font-black text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">{coin.symbol}</span>
                                            </div>
                                            <div className="flex gap-2 mt-1.5">
                                                {coin.graduated && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <Trophy className="w-2 h-2" /> Graduated
                                                    </span>
                                                )}
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-sm border bg-zinc-900 text-zinc-500 border-zinc-800 font-mono flex items-center gap-1">
                                                    CREATOR: {coin.creator.slice(0, 4)}...{coin.creator.slice(-4)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Price */}
                                <td className="py-4 text-right font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                    {formatPrice(coin.lastPriceUsd)}
                                </td>

                                {/* Market Cap */}
                                <td className="py-4 text-right font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">
                                    {formatMc(coin.estimatedMcUsd)}
                                </td>

                                {/* Volume */}
                                <td className="py-4 text-right font-mono text-zinc-400">
                                    {formatVolume(coin.volumeEth)}
                                </td>

                                {/* Velocity */}
                                <td className="py-4 text-right">
                                    <div className="inline-flex items-center gap-1 text-zinc-400 font-mono">
                                        <Flame className="w-3 h-3 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                                        {formatVelocity(coin.velocity)}
                                    </div>
                                </td>

                                {/* Trades */}
                                <td className="py-4 text-right">
                                    <div className="inline-flex items-center gap-1 text-zinc-400 font-mono">
                                        <ArrowUpRight className="w-3 h-3 text-zinc-600" />
                                        {coin.trades.toLocaleString()}
                                    </div>
                                </td>

                                {/* Tier */}
                                <td className="py-4 text-center">
                                    <span className={`text-[10px] px-2 py-1 rounded-sm border ${tier.bg} ${tier.color} font-black uppercase tracking-widest`}>
                                        {tier.label}
                                    </span>
                                </td>

                                {/* Score */}
                                <td className={`py-4 text-right font-black text-lg pr-8 ${getScoreColor(coin.score)}`}>
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
