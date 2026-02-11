import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BracketCoin {
    name: string;
    symbol: string;
    icon: string;
}

interface Matchup {
    id: string;
    coinA: BracketCoin;
    coinB: BracketCoin;
    winner?: 'A' | 'B';
}

const COINS: BracketCoin[] = [
    { name: 'Pepe', symbol: 'PEPE', icon: 'https://ui-avatars.com/api/?name=PE&background=4ADE80&color=fff' },
    { name: 'Myro', symbol: 'MYRO', icon: 'https://ui-avatars.com/api/?name=MY&background=F97316&color=fff' },
    { name: 'Wif', symbol: 'WIF', icon: 'https://ui-avatars.com/api/?name=WI&background=FCD34D&color=fff' },
    { name: 'Mog', symbol: 'MOG', icon: 'https://ui-avatars.com/api/?name=MO&background=3B82F6&color=fff' },
    { name: 'Bonk', symbol: 'BONK', icon: 'https://ui-avatars.com/api/?name=BO&background=EA580C&color=fff' },
    { name: 'Gigachad', symbol: 'GIGA', icon: 'https://ui-avatars.com/api/?name=GI&background=57534E&color=fff' },
    { name: 'Popcat', symbol: 'POPCAT', icon: 'https://ui-avatars.com/api/?name=PC&background=E879F9&color=fff' },
    { name: 'Brett', symbol: 'BRETT', icon: 'https://ui-avatars.com/api/?name=BR&background=2563EB&color=fff' },
];

// Quarter-finals
const quarterFinals: Matchup[] = [
    { id: 'qf1', coinA: COINS[0], coinB: COINS[1], winner: 'A' },
    { id: 'qf2', coinA: COINS[2], coinB: COINS[3], winner: 'A' },
    { id: 'qf3', coinA: COINS[4], coinB: COINS[5], winner: 'A' },
    { id: 'qf4', coinA: COINS[6], coinB: COINS[7], winner: 'A' },
];

// Semi-finals (winners of QFs)
const semiFinals: Matchup[] = [
    { id: 'sf1', coinA: COINS[0], coinB: COINS[2] },
    { id: 'sf2', coinA: COINS[4], coinB: COINS[6] },
];

// Final
const finals: Matchup[] = [
    { id: 'f1', coinA: { name: 'TBD', symbol: '???', icon: 'https://ui-avatars.com/api/?name=?&background=27272a&color=71717a' }, coinB: { name: 'TBD', symbol: '???', icon: 'https://ui-avatars.com/api/?name=?&background=27272a&color=71717a' } },
];

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
                    <Image src={matchup.coinA.icon} alt={matchup.coinA.name} fill className="object-cover" />
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
                    <Image src={matchup.coinB.icon} alt={matchup.coinB.name} fill className="object-cover" />
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
