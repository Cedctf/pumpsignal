import React from 'react';
import Head from 'next/head';
import BattleArena from '../components/battle/BattleArena';

export default function BattlePage() {
    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Head>
                <title>Coin Battle | PumpFight</title>
                <meta name="description" content="Bet on which coin will pump harder" />
            </Head>
            <div className="flex flex-col gap-10">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                        COIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">BATTLE</span>
                    </h1>
                    <p className="text-zinc-400 mt-3 text-lg">
                        Pick the coin that will pump harder. Winner takes the pool.
                    </p>
                </div>
                <BattleArena />
            </div>
        </div>
    );
}
