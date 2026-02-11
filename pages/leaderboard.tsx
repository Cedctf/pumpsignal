import React, { useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import {
    Trophy,
    Flame,
    TrendingUp,
    BarChart3,
    Activity,
    Zap
} from 'lucide-react';
import LeaderboardFilters from '../components/leaderboard/LeaderboardFilters';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import { fetchCurves } from '../lib/goldsky';
import { scoreCurves, rankCurves, SortMode } from '../lib/scoring';
import { Curve } from '../types';

export default function LeaderboardPage() {
    const [sortMode, setSortMode] = useState<SortMode>('score');

    const { data: curves, error, isLoading } = useSWR<Curve[]>(
        'latestCurves',
        fetchCurves,
        { refreshInterval: 5000 }
    );

    // Score and rank
    const scored = curves ? scoreCurves(curves) : [];
    const ranked = rankCurves(scored, sortMode);

    const sortOptions = [
        { key: 'score', label: 'Potential Score', icon: Trophy },
        { key: 'velocity', label: 'Velocity', icon: Flame },
        { key: 'volume', label: 'Volume', icon: BarChart3 },
        { key: 'marketcap', label: 'Market Cap', icon: TrendingUp },
    ] as const;

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Head>
                <title>Top Coins | PumpFight</title>
                <meta name="description" content="Real-time token potential leaderboard ranked by composite score" />
            </Head>

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-6 h-6 text-emerald-500" />
                            <span className="text-sm font-bold tracking-widest text-emerald-500 uppercase">Leaderboard</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
                            TOP <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">GLADIATORS</span>
                        </h1>
                        <p className="text-zinc-400 mt-2 max-w-2xl">
                            Real-time ranking of the most battle-ready tokens on Robin Pump. Scored by velocity, volume, and community strength.
                        </p>
                    </div>

                    {/* Live Status */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-full border border-zinc-800 backdrop-blur-sm">
                        <div className={`relative flex h-3 w-3`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLoading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isLoading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isLoading ? 'text-yellow-500' : error ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isLoading ? 'SYNCING...' : error ? 'CONNECTION LOST' : `LIVE DATA · ${ranked.length} TOKENS LOGGED`}
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    {sortOptions.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setSortMode(key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${sortMode === key
                                    ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)] transform scale-105'
                                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-400'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${sortMode === key ? 'text-black' : 'text-zinc-500'}`} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Table Layout */}
                <div className="bg-zinc-950/40 border border-emerald-500/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl relative">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
                    <LeaderboardTable curves={ranked} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
