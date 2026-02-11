import React, { useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
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

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            <Head>
                <title>Token Leaderboard | PumpSignal</title>
                <meta name="description" content="Real-time token potential leaderboard ranked by composite score" />
            </Head>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Token Leaderboard
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Real-time potential ranking — scored by velocity, volume, trades &amp; recency.
                        </p>
                    </div>

                    {/* Sort Mode Buttons */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {([
                            { key: 'score', label: '🏆 Potential Score' },
                            { key: 'velocity', label: '🔥 Velocity' },
                            { key: 'volume', label: '💰 Volume' },
                            { key: 'marketcap', label: '📊 Market Cap' },
                        ] as { key: SortMode; label: string }[]).map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setSortMode(key)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${sortMode === key
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}

                        {/* Live indicator */}
                        <div className="ml-auto flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                            <span className={`${isLoading ? 'text-yellow-500' : error ? 'text-red-500' : 'text-green-500'} font-medium`}>
                                {isLoading ? 'Loading...' : error ? 'Error' : `Live · ${ranked.length} tokens`}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
                        <LeaderboardTable curves={ranked} isLoading={isLoading} />
                    </div>
                </div>
            </main>
        </div>
    );
}
