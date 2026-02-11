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
    readOnly?: boolean;
}

const MatchupCard: React.FC<MatchupCardProps> = ({ matchup, roundLabel, readOnly }) => {
    const isTBD = matchup.coinA.symbol === '???' || matchup.coinB.symbol === '???';
    const isDisabled = isTBD || readOnly;
    const isGrandFinal = roundLabel === 'Grand Final';

    // Helper to determine style for a coin row
    const getCoinRowStyle = (isWinner: boolean) => {
        if (!readOnly && !isTBD) return ''; // Active betting card: normal style

        if (readOnly) {
            // For showcase cards (QF): Winner pops, loser fades
            if (isWinner) return 'opacity-100 scale-105 shadow-md bg-zinc-900 ring-1 ring-emerald-500/50';
            return 'opacity-30 saturate-0 scale-95';
        }
        return ''; // TBD: normal
    };

    // Inner content of the card
    const CardInner = (
        <div className={`
            relative rounded-xl p-4 transition-all duration-300 min-w-[180px] h-full flex flex-col justify-center
            ${isDisabled
                ? 'bg-zinc-900/20 border-zinc-800/30 cursor-default border'
                : isGrandFinal
                    ? 'bg-zinc-900' // Grand Final has special border wrapper, no border here
                    : 'bg-zinc-900/60 border-zinc-800 border hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:scale-105 cursor-pointer'
            }
        `}>
            {/* Round label */}
            <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-3 flex justify-between">
                <span className={isGrandFinal ? 'text-emerald-500 animate-pulse' : ''}>{roundLabel}</span>
                {readOnly && <span className="text-emerald-500/50">Finished</span>}
            </div>

            {/* Coin A */}
            <div className={`flex items-center gap-3 py-2 px-2 rounded-lg transition-all duration-300 ${getCoinRowStyle(matchup.winner === 'A')} ${matchup.winner === 'A' && !readOnly ? 'bg-emerald-500/10 border border-emerald-500/20' : ''}`}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                    <TokenAvatar uri={matchup.coinA.uri} name={matchup.coinA.name} symbol={matchup.coinA.symbol} size={32} className="rounded-full" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-200 truncate">{matchup.coinA.name}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{matchup.coinA.symbol}</span>
                </div>
                {matchup.winner === 'A' && <svg className="ml-auto w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
            </div>

            {/* VS */}
            <div className={`flex items-center gap-2 py-1.5 ${readOnly ? 'opacity-30' : ''}`}>
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] font-black text-zinc-600">VS</span>
                <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Coin B */}
            <div className={`flex items-center gap-3 py-2 px-2 rounded-lg transition-all duration-300 ${getCoinRowStyle(matchup.winner === 'B')} ${matchup.winner === 'B' && !readOnly ? 'bg-emerald-500/10 border border-emerald-500/20' : ''}`}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-700 shrink-0">
                    <TokenAvatar uri={matchup.coinB.uri} name={matchup.coinB.name} symbol={matchup.coinB.symbol} size={32} className="rounded-full" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-zinc-200 truncate">{matchup.coinB.name}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{matchup.coinB.symbol}</span>
                </div>
                {matchup.winner === 'B' && <svg className="ml-auto w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
            </div>

            {/* Bet badge */}
            {!isDisabled && (
                <div className="mt-3 text-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${isGrandFinal ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse' : 'text-emerald-500/80 bg-emerald-500/10 border-emerald-500/20'}`}>
                        {isGrandFinal ? 'BET ON FINAL' : 'Bet Now'}
                    </span>
                </div>
            )}
        </div>
    );

    // If Grand Final, wrap with animated border
    const FinalContent = isGrandFinal ? (
        <div className="relative group p-[1px] rounded-xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.3)]">
            <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#000000_0%,#10b981_50%,#000000_100%)] opacity-100" />
            <div className="relative h-full w-full rounded-xl bg-zinc-900 z-10">
                {CardInner}
            </div>
        </div>
    ) : CardInner;

    if (isDisabled) return FinalContent;

    return (
        <Link href={`/battle?left=${matchup.coinA.symbol}&right=${matchup.coinB.symbol}`}>
            {FinalContent}
        </Link>
    );
};

const BracketConnector: React.FC<{ type: 'merge' | 'split' | 'direct' | 'merge-right' }> = ({ type }) => {
    // Height is fixed to match the visually assumed height of the container (320px) check previous code
    // We use a responsive SVG

    return (
        <div className="w-12 h-[320px] flex items-center justify-center relative opacity-80">
            <svg width="100%" height="100%" viewBox="0 0 50 320" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="grad-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {type === 'merge' && (
                    <>
                        {/* Top to Center */}
                        <path
                            d="M 0 60 C 25 60, 25 160, 50 160"
                            fill="none"
                            stroke="url(#grad-line)"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                        />
                        {/* Bottom to Center */}
                        <path
                            d="M 0 260 C 25 260, 25 160, 50 160"
                            fill="none"
                            stroke="url(#grad-line)"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                        />
                    </>
                )}

                {type === 'merge-right' && (
                    <>
                        {/* Top (Right) to Center (Left) - mirrored logic essentially */}
                        <path
                            d="M 50 60 C 25 60, 25 160, 0 160"
                            fill="none"
                            stroke="url(#grad-line)"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                        />
                        <path
                            d="M 50 260 C 25 260, 25 160, 0 160"
                            fill="none"
                            stroke="url(#grad-line)"
                            strokeWidth="1.5"
                            filter="url(#glow)"
                        />
                    </>
                )}

                {type === 'direct' && (
                    <path
                        d="M 0 160 L 50 160"
                        fill="none"
                        stroke="url(#grad-line)"
                        strokeWidth="1.5"
                        filter="url(#glow)"
                    />
                )}
            </svg>
        </div>
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

                // Find specific coins for the fixed matchup
                const clawbot = ranked.find(c => c.name === 'ClawBot Agent' || c.symbol === 'CBA');
                const zero = ranked.find(c => c.name === 'Zero' || c.symbol === 'ZERO');

                // Filter them out from the pool to avoid duplicates
                const others = ranked.filter(c =>
                    c.name !== 'ClawBot Agent' && c.symbol !== 'CBA' &&
                    c.name !== 'Zero' && c.symbol !== 'ZERO'
                );

                // We need 6 other coins for the rest of the bracket
                const fillers = others.slice(0, 6);

                // Pad with placeholders if we don't have enough data
                while (fillers.length < 6) {
                    fillers.push({
                        name: 'Contender',
                        symbol: `C${fillers.length + 1}`,
                        uri: '',
                    } as any);
                }

                // Construct the 8-coin array with fixed positions for SF2
                // Indices 0-3: Left side (Random)
                // Index 4: ClawBot (Winner of QF3)
                // Index 5: Random Loser against ClawBot
                // Index 6: Zero (Winner of QF4)
                // Index 7: Random Loser against Zero

                const finalCoins: BracketCoin[] = [];

                // 0,1,2,3 - Left Side
                finalCoins.push(...fillers.slice(0, 4).map(c => ({ name: c.name, symbol: c.symbol, uri: c.uri || '' })));

                // 4 - ClawBot Agent (Fixed Winner QF3)
                if (clawbot) {
                    finalCoins.push({ name: clawbot.name, symbol: clawbot.symbol, uri: clawbot.uri || '' });
                } else {
                    // Fallback if not found
                    finalCoins.push({ name: 'ClawBot Agent', symbol: 'CBA', uri: '' });
                }

                // 5 - Loser QF3
                finalCoins.push({ name: fillers[4].name, symbol: fillers[4].symbol, uri: fillers[4].uri || '' });

                // 6 - Zero (Fixed Winner QF4)
                if (zero) {
                    finalCoins.push({ name: zero.name, symbol: zero.symbol, uri: zero.uri || '' });
                } else {
                    // Fallback if not found
                    finalCoins.push({ name: 'Zero', symbol: 'ZERO', uri: '' });
                }

                // 7 - Loser QF4
                finalCoins.push({ name: fillers[5].name, symbol: fillers[5].symbol, uri: fillers[5].uri || '' });

                setCoins(finalCoins);
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
                    <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
            <div className="min-w-[1100px] flex items-center justify-center gap-0">

                {/* ------ LEFT SIDE: QF1 + QF2 ------ */}
                <div className="flex flex-col gap-16">
                    {quarterFinals.slice(0, 2).map((m) => (
                        <MatchupCard key={m.id} matchup={m} roundLabel="Quarter-Final" readOnly={true} />
                    ))}
                </div>

                {/* Connector lines: QFs → SF1 */}
                <BracketConnector type="merge" />

                {/* ------ SEMI-FINAL 1 ------ */}
                <div className="flex flex-col justify-center">
                    <MatchupCard matchup={semiFinals[0]} roundLabel="Semi-Final" />
                </div>

                {/* Connector: SF1 → Final */}
                <BracketConnector type="direct" />

                {/* ------ FINAL ------ */}
                <div className="flex flex-col justify-center px-4">
                    <div className="relative scale-110">
                        <MatchupCard matchup={finals[0]} roundLabel="Grand Final" />
                    </div>
                </div>

                {/* Connector: SF2 → Final (Reversed) */}
                <div className="rotate-180">
                    <BracketConnector type="direct" />
                </div>

                {/* ------ SEMI-FINAL 2 ------ */}
                <div className="flex flex-col justify-center">
                    <MatchupCard matchup={semiFinals[1]} roundLabel="Semi-Final" />
                </div>

                {/* Connector lines: SF2 ← QFs */}
                <BracketConnector type="merge-right" />

                {/* ------ RIGHT SIDE: QF3 + QF4 ------ */}
                <div className="flex flex-col gap-16">
                    {quarterFinals.slice(2, 4).map((m) => (
                        <MatchupCard key={m.id} matchup={m} roundLabel="Quarter-Final" readOnly={true} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TournamentBracket;
