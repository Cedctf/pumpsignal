import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CoinCard, { CoinData } from './CoinCard';
import BetPanel from './BetPanel';

// Master coin directory — used for lookup by symbol
const COIN_DIRECTORY: Record<string, CoinData> = {
    PEPE: {
        name: 'Pepe', symbol: 'PEPE', icon: 'https://ui-avatars.com/api/?name=PE&background=4ADE80&color=fff',
        address: '0x6982...508f', creator: 'a4f2c1', age: '14d ago',
        price: '$0.00000823', priceEth: '0.0000000042', ethUsd: '$1953.50',
        change24h: '+12.5%', changeSinceLaunch: '+844.20%',
        marketCap: '$3.45B', ath: '$8.21B', athProgress: 42,
        volume24h: '$840.2M',
        bondingCurveProgress: 100, bondingCurveEth: '85.0 ETH', graduateTarget: 'Graduated',
    },
    WIF: {
        name: 'Wif', symbol: 'WIF', icon: 'https://ui-avatars.com/api/?name=WI&background=FCD34D&color=fff',
        address: '0xf29b...dd4c', creator: '7b3e91', age: '30d ago',
        price: '$2.45', priceEth: '0.001254', ethUsd: '$1953.50',
        change24h: '-3.1%', changeSinceLaunch: '+1,220.00%',
        marketCap: '$2.45B', ath: '$4.80B', athProgress: 51,
        volume24h: '$420.5M',
        bondingCurveProgress: 100, bondingCurveEth: '85.0 ETH', graduateTarget: 'Graduated',
    },
    BONK: {
        name: 'Bonk', symbol: 'BONK', icon: 'https://ui-avatars.com/api/?name=BO&background=EA580C&color=fff',
        address: '0x16b2...a881', creator: 'c9d4f2', age: '45d ago',
        price: '$0.0000241', priceEth: '0.0000000123', ethUsd: '$1953.50',
        change24h: '+5.8%', changeSinceLaunch: '+620.50%',
        marketCap: '$1.62B', ath: '$2.90B', athProgress: 56,
        volume24h: '$180.3M',
        bondingCurveProgress: 100, bondingCurveEth: '85.0 ETH', graduateTarget: 'Graduated',
    },
    POPCAT: {
        name: 'Popcat', symbol: 'POPCAT', icon: 'https://ui-avatars.com/api/?name=PC&background=E879F9&color=fff',
        address: '0xed88...f3c4', creator: '5a1bc3', age: '7d ago',
        price: '$0.42', priceEth: '0.000215', ethUsd: '$1953.50',
        change24h: '+24.1%', changeSinceLaunch: '+3,400.00%',
        marketCap: '$420.0M', ath: '$620.0M', athProgress: 68,
        volume24h: '$45.2M',
        bondingCurveProgress: 78, bondingCurveEth: '66.3 ETH', graduateTarget: '$52,180 to graduate',
    },
    MOG: {
        name: 'Mog', symbol: 'MOG', icon: 'https://ui-avatars.com/api/?name=MO&background=3B82F6&color=fff',
        address: '0xa113...d9e1', creator: 'e8f7a2', age: '21d ago',
        price: '$0.0000012', priceEth: '0.00000000061', ethUsd: '$1953.50',
        change24h: '+5.6%', changeSinceLaunch: '+290.00%',
        marketCap: '$380.5M', ath: '$520.0M', athProgress: 73,
        volume24h: '$32.1M',
        bondingCurveProgress: 100, bondingCurveEth: '85.0 ETH', graduateTarget: 'Graduated',
    },
    GIGA: {
        name: 'Gigachad', symbol: 'GIGA', icon: 'https://ui-avatars.com/api/?name=GI&background=57534E&color=fff',
        address: '0x3c71...ab12', creator: '1627a1', age: '3d ago',
        price: '$0.042', priceEth: '0.0000215', ethUsd: '$1953.50',
        change24h: '+15.3%', changeSinceLaunch: '+144.20%',
        marketCap: '$120.4M', ath: '$180.0M', athProgress: 67,
        volume24h: '$12.5M',
        bondingCurveProgress: 45, bondingCurveEth: '38.2 ETH', graduateTarget: '$43,954 to graduate',
    },
    BRETT: {
        name: 'Brett', symbol: 'BRETT', icon: 'https://ui-avatars.com/api/?name=BR&background=2563EB&color=fff',
        address: '0x8a4f...c2d7', creator: 'b5d9e3', age: '60d ago',
        price: '$0.082', priceEth: '0.000042', ethUsd: '$1953.50',
        change24h: '-1.2%', changeSinceLaunch: '+1,640.00%',
        marketCap: '$820.0M', ath: '$1.50B', athProgress: 55,
        volume24h: '$55.1M',
        bondingCurveProgress: 100, bondingCurveEth: '85.0 ETH', graduateTarget: 'Graduated',
    },
    MYRO: {
        name: 'Myro', symbol: 'MYRO', icon: 'https://ui-avatars.com/api/?name=MY&background=F97316&color=fff',
        address: '0x3671...9eb9', creator: 'd2a4c1', age: '8d ago',
        price: '$0.015', priceEth: '0.0000077', ethUsd: '$1953.50',
        change24h: '+8.4%', changeSinceLaunch: '+450.00%',
        marketCap: '$150.0M', ath: '$210.0M', athProgress: 71,
        volume24h: '$18.7M',
        bondingCurveProgress: 18, bondingCurveEth: '0.84 ETH', graduateTarget: '$43,954 to graduate',
    },
};

const getSecondsToMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

const BattleArena: React.FC = () => {
    const router = useRouter();
    const leftSymbol = (router.query.left as string || 'PEPE').toUpperCase();
    const rightSymbol = (router.query.right as string || 'WIF').toUpperCase();

    const coinA = COIN_DIRECTORY[leftSymbol] || COIN_DIRECTORY.PEPE;
    const coinB = COIN_DIRECTORY[rightSymbol] || COIN_DIRECTORY.WIF;

    const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(getSecondsToMidnight());

    // Tick every second
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(getSecondsToMidnight());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const poolLeft = 124.5;
    const poolRight = 78.2;

    return (
        <div className="flex flex-col gap-10">
            {/* Countdown to next day */}
            <div className="flex justify-center">
                <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-3">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Round ends in</span>
                    <span className="text-xl font-mono font-bold text-white tracking-widest tabular-nums">
                        {formatTime(secondsLeft)}
                    </span>
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
                    <BetPanel selectedCoinName={selectedSide === 'left' ? coinA.name : coinB.name} selectedSide={selectedSide} timeInterval={'24H'} poolLeft={poolLeft} poolRight={poolRight} />
                </div>
            )}

            {!selectedSide && (
                <p className="text-center text-zinc-600 text-sm animate-pulse">Select a coin to place your bet</p>
            )}
        </div>
    );
};

export default BattleArena;
