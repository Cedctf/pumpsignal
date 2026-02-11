import React from 'react';
import Image from 'next/image';

export interface CoinData {
    name: string;
    symbol: string;
    icon: string;
    address: string;
    creator: string;
    age: string;
    price: string;
    priceEth: string;
    ethUsd: string;
    change24h: string;
    changeSinceLaunch: string;
    marketCap: string;
    ath: string;
    athProgress: number; // 0–100, how close current mcap is to ATH
    volume24h: string;
    bondingCurveProgress: number; // 0–100
    bondingCurveEth: string;
    graduateTarget: string;
}

interface CoinCardProps {
    coin: CoinData;
    side: 'left' | 'right';
    isSelected: boolean;
    onSelect: () => void;
}

const CoinCard: React.FC<CoinCardProps> = ({ coin, side, isSelected, onSelect }) => {
    const accent = side === 'left' ? 'blue' : 'purple';
    const isPositive = coin.change24h.startsWith('+');
    const isLaunchPositive = coin.changeSinceLaunch.startsWith('+');

    // Mock chart data points for the SVG line
    const chartPoints = side === 'left'
        ? [20, 18, 22, 19, 25, 30, 55, 80, 65, 45, 35, 30, 28, 25, 22, 24, 22, 20, 21, 20]
        : [30, 32, 28, 35, 40, 38, 42, 50, 48, 55, 60, 58, 62, 70, 68, 65, 60, 58, 55, 52];

    const maxY = Math.max(...chartPoints);
    const minY = Math.min(...chartPoints);
    const range = maxY - minY || 1;
    const svgW = 400;
    const svgH = 120;
    const padding = 4;

    const pathD = chartPoints
        .map((v, i) => {
            const x = padding + (i / (chartPoints.length - 1)) * (svgW - padding * 2);
            const y = padding + (1 - (v - minY) / range) * (svgH - padding * 2);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join(' ');

    // Closed area fill path
    const lastX = padding + ((chartPoints.length - 1) / (chartPoints.length - 1)) * (svgW - padding * 2);
    const firstX = padding;
    const areaD = `${pathD} L ${lastX.toFixed(1)} ${svgH} L ${firstX.toFixed(1)} ${svgH} Z`;

    return (
        <button
            onClick={onSelect}
            className={`
                relative w-full rounded-2xl text-left transition-all duration-300 cursor-pointer
                bg-zinc-900/60 backdrop-blur-md border flex flex-col
                hover:scale-[1.01] hover:shadow-2xl
                ${isSelected
                    ? accent === 'blue'
                        ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                        : 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }
            `}
        >
            {/* Selected badge */}
            {isSelected && (
                <div className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${accent === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'}
                `}>
                    Selected
                </div>
            )}

            {/* ── Header: Icon + Name + Address ── */}
            <div className="flex items-center gap-4 p-5 pb-0">
                <div className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${isSelected
                        ? accent === 'blue' ? 'border-blue-500' : 'border-purple-500'
                        : 'border-zinc-700'
                    }`}>
                    <Image src={coin.icon} alt={coin.name} fill className="object-cover" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">{coin.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="font-bold">{coin.symbol}</span>
                        <span className="font-mono truncate">{coin.address}</span>
                    </div>
                    <div className="text-[11px] text-zinc-600 mt-0.5">
                        by: {coin.creator} · {coin.age}
                    </div>
                </div>
            </div>

            {/* ── Market Cap Section ── */}
            <div className="p-5 pb-0">
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Market Cap</p>
                    <p className="text-2xl font-bold text-white">{coin.marketCap}</p>

                    {/* ATH progress bar */}
                    <div className="mt-3 mb-2">
                        <div className="w-full h-2 rounded-full bg-zinc-700 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-green-500 transition-all duration-500"
                                style={{ width: `${coin.athProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                            <span className="text-zinc-600">0</span>
                            <span className="text-zinc-500">ATH {coin.ath}</span>
                        </div>
                    </div>

                    {/* 24h change + volume */}
                    <div className="flex items-center gap-3 text-xs mt-1">
                        <span className={isPositive ? 'text-green-400' : 'text-red-400'}>
                            {coin.change24h} 24hr
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-400">Vol 24h <span className="font-semibold text-zinc-300">{coin.volume24h}</span></span>
                    </div>
                </div>
            </div>

            {/* ── Chart Area ── */}
            <div className="px-5 pt-3">
                <div className="bg-zinc-800/50 rounded-xl border border-zinc-800 overflow-hidden p-3">
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-28" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`fill-${side}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d={areaD} fill={`url(#fill-${side})`} />
                        <path d={pathD} fill="none" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* ── Bottom Stats Row ── */}
            <div className="px-5 pt-3">
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'Price', value: coin.price },
                        { label: 'From Launch', value: coin.changeSinceLaunch, color: isLaunchPositive ? 'text-green-400' : 'text-red-400' },
                        { label: 'Price (in ETH)', value: coin.priceEth },
                        { label: 'ETH/USD', value: coin.ethUsd },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-zinc-800/50 rounded-lg border border-zinc-800 p-2.5 text-center">
                            <p className="text-[10px] text-zinc-500 mb-1">{stat.label}</p>
                            <p className={`text-xs font-semibold ${stat.color || 'text-zinc-300'}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Bonding Curve Progress ── */}
            <div className="p-5">
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-zinc-300">Bonding Curve Progress</span>
                        <span className="text-sm font-bold text-zinc-200">{coin.bondingCurveProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-zinc-700 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-green-500 transition-all duration-500"
                            style={{ width: `${coin.bondingCurveProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mt-2">
                        <span>{coin.bondingCurveEth} in bonding curve</span>
                        <span>{coin.graduateTarget} to graduate</span>
                    </div>
                </div>
            </div>
        </button>
    );
};

export default CoinCard;
