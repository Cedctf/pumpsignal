import React from 'react';
import Head from 'next/head';
import TournamentBracket from '../components/bracket/TournamentBracket';

export default function BracketPage() {
    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Head>
                <title>Coin Tournament | PumpFight</title>
                <meta name="description" content="8-coin elimination tournament — bet on every matchup" />
            </Head>

            <div className="flex flex-col gap-10">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                        COIN <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">TOURNAMENT</span>
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
                                <span className={`text-xs font-bold uppercase tracking-widest ${i === 1 ? 'text-emerald-500' : 'text-zinc-600'}`}>
                                    {label}
                                </span>
                                {i < 2 && <span className="text-zinc-800">/</span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Bracket */}
                <TournamentBracket />
            </div>
        </div>
    );
}
