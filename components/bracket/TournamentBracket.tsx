import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import TokenAvatar from '../TokenAvatar';
import { fetchCurves } from '../../lib/goldsky';
import { scoreCurves, rankCurves } from '../../lib/scoring';
import type { Curve } from '../../types';

interface BracketCoin {
    name: string;
    symbol: string;
    uri: string;          // ipfs:// URI for TokenAvatar
}

interface Matchup {
    id: string;
    coinA: BracketCoin;
    coinB: BracketCoin;
    winner?: 'A' | 'B';
}

// Seeded PRNG so the bracket stays fixed for the whole day
const seededRandom = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
    };
};

const shuffleWithSeed = <T,>(arr: T[]): T[] => {
    // Seed from today's date → same bracket all day
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const rng = seededRandom(seed);

    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const TBD_COIN: BracketCoin = {
    name: 'TBD',
    symbol: '???',
    uri: '',
};

interface MatchupCardProps {
    matchup: Matchup;
    roundLabel: string;
}

const MatchupCard: React.FC<MatchupCardProps> = ({ matchup, roundLabel }) => {
    const isTBD = matchup.coinA.symbol === '???' || matchup.coinB.symbol === '???';

    const content = (
        <div className={`
            relative rounded-xl border p-4 transition-all duration-300 min-w-[180px]
            ${isTBD
                ? 'bg-zinc-900/30 border-zinc-800/50 cursor-default opacity-50'
                : 'bg-zinc-900/60 border-zinc-800 hover:border-yellow-500/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] hover:scale-105 cursor-pointer'
            }
        `}>
            {/* Round label */}
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-3">{roundLabel}</div>

            {/* Coin A */}
            <div className={`flex items-center gap-3 py-2 px-2 rounded-lg ${matchup.winner === 'A' ? 'bg-green-500/10 border border-green-500/20' : ''}`}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                    <TokenAvatar uri={matchup.coinA.uri} name={matchup.coinA.name} symbol={matchup.coinA.symbol} size={32} className="rounded-full" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-200 truncate">{matchup.coinA.name}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{matchup.coinA.symbol}</span>
                </div>
                {matchup.winner === 'A' && <svg className="ml-auto w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
            </div>

            {/* VS */}
            <div className="flex items-center gap-2 py-1.5">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] font-black text-zinc-600">VS</span>
                <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Coin B */}
            <div className={`flex items-center gap-3 py-2 px-2 rounded-lg ${matchup.winner === 'B' ? 'bg-green-500/10 border border-green-500/20' : ''}`}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                    <TokenAvatar uri={matchup.coinB.uri} name={matchup.coinB.name} symbol={matchup.coinB.symbol} size={32} className="rounded-full" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-200 truncate">{matchup.coinB.name}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{matchup.coinB.symbol}</span>
                </div>
                {matchup.winner === 'B' && <svg className="ml-auto w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
            </div>

            {/* Bet badge */}
            {!isTBD && (
                <div className="mt-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                        Bet Now
                    </span>
                </div>
            )}
        </div>
    );

    if (isTBD) return content;

    return (
        <Link href={`/battle?left=${matchup.coinA.symbol}&right=${matchup.coinB.symbol}`}>
            {content}
        </Link>
    );
};

const TournamentBracket: React.FC = () => {
    const [coins, setCoins] = useState<BracketCoin[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurves()
            .then((curves: Curve[]) => {
                const scored = scoreCurves(curves);
                const ranked = rankCurves(scored, 'score');
                const top8 = ranked.slice(0, 8);
                const bracketCoins: BracketCoin[] = top8.map((c) => ({
                    name: c.name,
                    symbol: c.symbol,
                    uri: c.uri || '',
                }));
                setCoins(shuffleWithSeed(bracketCoins));
            })
            .catch(() => setCoins([]))
            .finally(() => setLoading(false));
    }, []);

    // Build matchups from real coins
    const { quarterFinals, semiFinals, finals } = useMemo(() => {
        if (coins.length < 8) {
            return {
                quarterFinals: [] as Matchup[],
                semiFinals: [] as Matchup[],
                finals: [] as Matchup[],
            };
        }

        const qf: Matchup[] = [
            { id: 'qf1', coinA: coins[0], coinB: coins[1], winner: 'A' },
            { id: 'qf2', coinA: coins[2], coinB: coins[3], winner: 'A' },
            { id: 'qf3', coinA: coins[4], coinB: coins[5], winner: 'A' },
            { id: 'qf4', coinA: coins[6], coinB: coins[7], winner: 'A' },
        ];

        const sf: Matchup[] = [
            { id: 'sf1', coinA: coins[0], coinB: coins[2] },
            { id: 'sf2', coinA: coins[4], coinB: coins[6] },
        ];

        const f: Matchup[] = [
            { id: 'f1', coinA: TBD_COIN, coinB: TBD_COIN },
        ];

        return { quarterFinals: qf, semiFinals: sf, finals: f };
    }, [coins]);

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-zinc-500 text-sm">Loading tournament…</span>
                </div>
            </div>
        );
    }

    if (coins.length < 8) {
        return (
            <div className="w-full text-center py-20 text-zinc-500">
                Not enough coins to populate the bracket.
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto pb-8">
            <div className="min-w-[900px] flex items-center justify-center gap-0">

                {/* ------ LEFT SIDE: QF1 + QF2 ------ */}
                <div className="flex flex-col gap-16">
                    {quarterFinals.slice(0, 2).map((m) => (
                        <MatchupCard key={m.id} matchup={m} roundLabel="Quarter-Final" />
                    ))}
                </div>

                {/* Connector lines: QFs → SF1 */}
                <div className="flex flex-col items-center justify-center w-12 relative" style={{ height: 320 }}>
                    {/* Top arm */}
                    <div className="absolute top-[60px] right-0 w-6 h-px bg-zinc-700" />
                    <div className="absolute top-[60px] right-0 w-px bg-zinc-700" style={{ height: 100 }} />
                    {/* Bottom arm */}
                    <div className="absolute bottom-[60px] right-0 w-6 h-px bg-zinc-700" />
                    <div className="absolute bottom-[60px] right-0 w-px bg-zinc-700" style={{ height: 100 }} />
                    {/* Middle connector */}
                    <div className="absolute top-[160px] right-0 w-6 h-px bg-zinc-700" />
                </div>

                {/* ------ SEMI-FINAL 1 ------ */}
                <div className="flex flex-col justify-center">
                    <MatchupCard matchup={semiFinals[0]} roundLabel="Semi-Final" />
                </div>

                {/* Connector: SF1 → Final */}
                <div className="flex flex-col items-center justify-center w-12 relative" style={{ height: 320 }}>
                    <div className="absolute top-[160px] left-0 w-full h-px bg-zinc-700" />
                    {/* Vertical to final */}
                    <div className="absolute left-1/2 w-px bg-zinc-700" style={{ top: 160, height: 0 }} />
                </div>

                {/* ------ FINAL ------ */}
                <div className="flex flex-col justify-center">
                    <div className="relative">
                        <MatchupCard matchup={finals[0]} roundLabel="Grand Final" />
                    </div>
                </div>

                {/* Connector: SF2 → Final */}
                <div className="flex flex-col items-center justify-center w-12 relative" style={{ height: 320 }}>
                    <div className="absolute top-[160px] right-1/2 w-full h-px bg-zinc-700" />
                </div>

                {/* ------ SEMI-FINAL 2 ------ */}
                <div className="flex flex-col justify-center">
                    <MatchupCard matchup={semiFinals[1]} roundLabel="Semi-Final" />
                </div>

                {/* Connector lines: SF2 ← QFs */}
                <div className="flex flex-col items-center justify-center w-12 relative" style={{ height: 320 }}>
                    <div className="absolute top-[60px] left-0 w-6 h-px bg-zinc-700" />
                    <div className="absolute top-[60px] left-0 w-px bg-zinc-700" style={{ height: 100 }} />
                    <div className="absolute bottom-[60px] left-0 w-6 h-px bg-zinc-700" />
                    <div className="absolute bottom-[60px] left-0 w-px bg-zinc-700" style={{ height: 100 }} />
                    <div className="absolute top-[160px] left-0 w-6 h-px bg-zinc-700" />
                </div>

                {/* ------ RIGHT SIDE: QF3 + QF4 ------ */}
                <div className="flex flex-col gap-16">
                    {quarterFinals.slice(2, 4).map((m) => (
                        <MatchupCard key={m.id} matchup={m} roundLabel="Quarter-Final" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TournamentBracket;
