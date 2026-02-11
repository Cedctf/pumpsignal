import React from 'react';
import Head from 'next/head';
import LeaderboardFilters from '../components/leaderboard/LeaderboardFilters';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
            <Head>
                <title>Top Coins | PumpSignal</title>
                <meta name="description" content="Top performing coins on Pump.fun" />
            </Head>

            {/* Navigation - keeping it simple if component is missing, but aiming to include if possible */}
            {/* <TopNav /> */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Top Coins
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Top performing assets ranked by Market Cap and Volume.
                        </p>
                    </div>

                    {/* Filters */}
                    <LeaderboardFilters />

                    {/* Table */}
                    <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
                        <LeaderboardTable />
                    </div>
                </div>
            </main>
        </div>
    );
}
