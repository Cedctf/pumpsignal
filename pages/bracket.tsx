import React from 'react';
import Head from 'next/head';
import TournamentBracket from '../components/bracket/TournamentBracket';

export default function BracketPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30">
            <Head>
                <title>Coin Tournament | PumpSignal</title>
                <meta name="description" content="8-coin elimination tournament — bet on every matchup" />
            </Head>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col gap-10">
                    {/* Header */}
                    <div className="text-center">

                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Coin Tournament
                        </h1>
                        <p className="text-zinc-400 mt-3 text-lg max-w-xl mx-auto">
                            8 coins enter, 1 survives. Click any matchup to place your bet.
                        </p>
                    </div>

                    {/* Round labels */}
                    <div className="flex justify-center">
                        <div className="flex items-center gap-4">
                            {['Quarter-Finals', 'Semi-Finals', 'Grand Final'].map((label, i) => (
                                <React.Fragment key={label}>
                                    <span className={`text-xs font-bold uppercase tracking-widest ${i === 2 ? 'text-yellow-500' : 'text-zinc-600'}`}>
                                        {label}
                                    </span>
                                    {i < 2 && <span className="text-zinc-700">/</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Bracket */}
                    <TournamentBracket />
                </div>
            </main>
        </div>
    );
}
