import React, { useState } from 'react';
import { useRouter } from 'next/router';
import CoinCard, { CoinData } from './CoinCard';
import BetPanel from './BetPanel';

// Master coin directory — used for lookup by symbol
const COIN_DIRECTORY: Record<string, CoinData> = {
    PEPE: { name: 'Pepe', symbol: 'PEPE', icon: 'https://ui-avatars.com/api/?name=PE&background=4ADE80&color=fff', price: '$0.00000823', change24h: '+12.5%', marketCap: '$3.45B', volume24h: '$840.2M' },
    WIF: { name: 'Wif', symbol: 'WIF', icon: 'https://ui-avatars.com/api/?name=WI&background=FCD34D&color=fff', price: '$2.45', change24h: '-3.1%', marketCap: '$2.45B', volume24h: '$420.5M' },
    BONK: { name: 'Bonk', symbol: 'BONK', icon: 'https://ui-avatars.com/api/?name=BO&background=EA580C&color=fff', price: '$0.0000241', change24h: '+5.8%', marketCap: '$1.62B', volume24h: '$180.3M' },
    POPCAT: { name: 'Popcat', symbol: 'POPCAT', icon: 'https://ui-avatars.com/api/?name=PC&background=E879F9&color=fff', price: '$0.42', change24h: '+24.1%', marketCap: '$420.0M', volume24h: '$45.2M' },
    MOG: { name: 'Mog', symbol: 'MOG', icon: 'https://ui-avatars.com/api/?name=MO&background=3B82F6&color=fff', price: '$0.0000012', change24h: '+5.6%', marketCap: '$380.5M', volume24h: '$32.1M' },
    GIGA: { name: 'Gigachad', symbol: 'GIGA', icon: 'https://ui-avatars.com/api/?name=GI&background=57534E&color=fff', price: '$0.042', change24h: '+15.3%', marketCap: '$120.4M', volume24h: '$12.5M' },
    BRETT: { name: 'Brett', symbol: 'BRETT', icon: 'https://ui-avatars.com/api/?name=BR&background=2563EB&color=fff', price: '$0.082', change24h: '-1.2%', marketCap: '$820.0M', volume24h: '$55.1M' },
    MYRO: { name: 'Myro', symbol: 'MYRO', icon: 'https://ui-avatars.com/api/?name=MY&background=F97316&color=fff', price: '$0.015', change24h: '+8.4%', marketCap: '$150.0M', volume24h: '$18.7M' },
};

const TIME_INTERVALS = ['1H', '6H', '12H', '24H'];

const BattleArena: React.FC = () => {
    const router = useRouter();
    const leftSymbol = (router.query.left as string || 'PEPE').toUpperCase();
    const rightSymbol = (router.query.right as string || 'WIF').toUpperCase();

    const coinA = COIN_DIRECTORY[leftSymbol] || COIN_DIRECTORY.PEPE;
    const coinB = COIN_DIRECTORY[rightSymbol] || COIN_DIRECTORY.WIF;

    const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
    const [timeInterval, setTimeInterval] = useState('6H');

    const poolLeft = 124.5;
    const poolRight = 78.2;

    return (
        <div className="flex flex-col gap-10">
            {/* Time Interval Selector */}
            <div className="flex justify-center">
                <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
                    {TIME_INTERVALS.map((t) => (
                        <button key={t} onClick={() => setTimeInterval(t)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${timeInterval === t ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Battle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-0 items-stretch">
                <div className="flex">
                    <CoinCard coin={coinA} side="left" isSelected={selectedSide === 'left'} onSelect={() => setSelectedSide('left')} />
                </div>

                {/* VS Divider */}
                <div className="flex items-center justify-center md:px-6">
                    <div className="hidden md:flex flex-col items-center gap-3">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
                        <div className="relative">
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-300 to-purple-400">VS</span>
                            <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-yellow-500/10 animate-ping" /></div>
                        </div>
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
                    </div>
                    <div className="md:hidden flex items-center gap-4 w-full">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-300 to-purple-400">VS</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                    </div>
                </div>

                <div className="flex">
                    <CoinCard coin={coinB} side="right" isSelected={selectedSide === 'right'} onSelect={() => setSelectedSide('right')} />
                </div>
            </div>

            {/* Bet Panel */}
            {selectedSide && (
                <div className="animate-fade-in">
                    <BetPanel selectedCoinName={selectedSide === 'left' ? coinA.name : coinB.name} selectedSide={selectedSide} timeInterval={timeInterval} poolLeft={poolLeft} poolRight={poolRight} />
                </div>
            )}

            {!selectedSide && (
                <p className="text-center text-zinc-600 text-sm animate-pulse">Select a coin to place your bet</p>
            )}
        </div>
    );
};

export default BattleArena;
