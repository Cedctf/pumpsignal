import React from 'react';
import Head from 'next/head';
import BattleArena from '../components/battle/BattleArena';

export default function BattlePage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
            <Head>
                <title>Coin Battle | PumpSignal</title>
                <meta name="description" content="Bet on which coin will pump harder" />
            </Head>
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-10">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-yellow-300 to-purple-400 bg-clip-text text-transparent">
                            Coin Battle
                        </h1>
                        <p className="text-zinc-400 mt-3 text-lg">
                            Pick the coin that will pump harder. Winner takes the pool.
                        </p>
                    </div>
                    <BattleArena />
                </div>
            </main>
        </div>
    );
}
