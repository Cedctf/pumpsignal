import React, { useState } from 'react';
import useSWR from 'swr';
import { Leaf, ChevronDown, Rocket, User, Bot, LayoutGrid, Heart, DollarSign, Activity, Image as ImageIcon } from 'lucide-react';
import { fetchCurves } from '../lib/goldsky';
import { Curve } from '../types';

// ── Helpers ──────────────────────────────────────────────

const timeAgo = (timestamp: string | null): string => {
    if (!timestamp) return 'never';
    const now = Date.now();
    const diff = now - Number(timestamp) * 1000;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const formatMarketCap = (priceUsd: string): string => {
    const mc = Number(priceUsd) * 1_000_000_000; // assume 1B supply
    if (mc >= 1_000_000) return `${(mc / 1_000_000).toFixed(2)}M`;
    if (mc >= 1_000) return `${(mc / 1_000).toFixed(2)}K`;
    return mc.toFixed(2);
};

const ICON_TYPES = ['rocket', 'person', 'zero', 'cartoon', 'bot', 'kids', 'abstract', 'gold', 'coin'] as const;
const BG_COLORS = [
    'bg-blue-900', 'bg-blue-600', 'bg-yellow-400', 'bg-red-500',
    'bg-emerald-700', 'bg-gray-800', 'bg-purple-900', 'bg-yellow-700',
    'bg-amber-900', 'bg-indigo-800', 'bg-rose-700', 'bg-teal-700',
];

const getVisuals = (id: string) => {
    const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return {
        imgType: ICON_TYPES[hash % ICON_TYPES.length],
        imgColor: BG_COLORS[hash % BG_COLORS.length],
    };
};

// ── Component ────────────────────────────────────────────

const RobinPumpInterface = () => {
    const [activeFilter, setActiveFilter] = useState('Newest');

    const { data: curves, error, isLoading } = useSWR<Curve[]>(
        'latestCurves',
        fetchCurves,
        { refreshInterval: 3000 }
    );

    const renderIcon = (type: string) => {
        switch (type) {
            case 'rocket': return <Rocket size={48} className="text-white drop-shadow-lg" />;
            case 'person': return <User size={48} className="text-white drop-shadow-lg" />;
            case 'zero': return <span className="text-5xl font-black text-black">0</span>;
            case 'cartoon': return <LayoutGrid size={48} className="text-gray-800" />;
            case 'bot': return <Bot size={48} className="text-white" />;
            case 'kids': return <Heart size={48} className="text-pink-400" />;
            case 'abstract': return <Activity size={48} className="text-cyan-400" />;
            case 'gold': return <DollarSign size={48} className="text-yellow-200" />;
            case 'coin': return <div className="rounded-full border-4 border-yellow-500 w-12 h-12 flex items-center justify-center text-yellow-500 font-bold">$</div>;
            default: return <ImageIcon size={48} className="text-gray-500" />;
        }
    };

    // Sort based on active filter
    const sortedCurves = curves ? [...curves].sort((a, b) => {
        if (activeFilter === 'Market Cap') {
            return Number(b.lastPriceUsd) - Number(a.lastPriceUsd);
        }
        return Number(b.createdAt) - Number(a.createdAt); // Newest
    }) : [];

    return (
        <div className="min-h-screen bg-black text-gray-300 font-sans selection:bg-green-500 selection:text-black">
            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-900 bg-[#0a0a0a]">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="text-green-500">
                            <Leaf size={24} fill="currentColor" />
                        </div>
                        <span className="text-white text-xl font-bold tracking-tight">RobinPump</span>
                    </div>
                    <a href="#" className="hidden md:block text-gray-400 hover:text-white text-sm font-medium transition-colors">
                        Leaderboard
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#252525] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-800">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                        <span>0x3324...C66A</span>
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                    <button className="bg-[#00e336] hover:bg-[#00c92f] text-black font-bold px-5 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors">
                        <span>+</span> Launch
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="p-6 max-w-[1600px] mx-auto">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">Live coins</h1>
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                        <span className={`${isLoading ? 'text-yellow-500' : error ? 'text-red-500' : 'text-green-500'} font-medium`}>
                            {isLoading ? 'Connecting...' : error ? 'Error' : 'Live'}
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveFilter('Newest')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'Newest'
                            ? 'bg-[#00e336] text-black'
                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
                            }`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setActiveFilter('Market Cap')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeFilter === 'Market Cap'
                            ? 'bg-[#00e336] text-black'
                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
                            }`}
                    >
                        Market Cap
                    </button>
                </div>

                {/* Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Loading state */}
                    {isLoading && (
                        <div className="col-span-full py-20 text-center text-gray-500 text-lg">
                            Loading market data...
                        </div>
                    )}

                    {/* Error state */}
                    {error && !curves && (
                        <div className="col-span-full py-20 text-center text-red-500 text-lg">
                            Failed to load data. Retrying...
                        </div>
                    )}

                    {/* Data cards */}
                    {sortedCurves.map((curve) => {
                        const { imgType, imgColor } = getVisuals(curve.id);
                        const progress = curve.graduated
                            ? 100
                            : Math.min((Number(curve.totalVolumeEth) / 4) * 100, 100);
                        const progressColor = progress >= 75 ? 'bg-green-500' : 'bg-orange-500';

                        return (
                            <div
                                key={curve.id}
                                className="bg-[#111] hover:bg-[#161616] border border-gray-900/50 rounded-xl p-4 transition-all duration-200 cursor-pointer group flex gap-4 h-[180px]"
                            >
                                {/* Card Image Area */}
                                <div className={`w-[140px] h-full flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center ${imgColor} relative`}>
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    <div className="z-10 transform group-hover:scale-110 transition-transform duration-300">
                                        {renderIcon(imgType)}
                                    </div>
                                </div>

                                {/* Card Content Area */}
                                <div className="flex flex-col justify-between flex-grow min-w-0">

                                    {/* Header: Title & Ticker */}
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-white text-base truncate pr-2">{curve.name}</h3>
                                                <p className="text-xs text-gray-500 font-mono">{curve.symbol}</p>
                                            </div>
                                        </div>

                                        {/* Metadata Line: Creator & Time */}
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                            <div className="w-4 h-4 rounded bg-purple-900 flex items-center justify-center text-[8px]">
                                                <User size={8} className="text-purple-300" />
                                            </div>
                                            <span className="font-mono hover:underline cursor-pointer">
                                                {curve.creator.slice(-6)}
                                            </span>
                                            <span className="text-gray-600">•</span>
                                            <span>{timeAgo(curve.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-300 font-bold">MC ${formatMarketCap(curve.lastPriceUsd)}</span>
                                            <span className={progress > 0 ? "text-green-400" : "text-green-500/70"}>
                                                {curve.graduated ? 'Graduated ✓' : `${progress.toFixed(0)}%`}
                                            </span>
                                        </div>

                                        {/* Custom Striped Progress Bar */}
                                        <div className="h-3 w-full bg-gray-800/50 rounded-full overflow-hidden relative">
                                            <div
                                                className={`h-full ${progressColor} relative transition-all duration-500`}
                                                style={{ width: `${progress}%` }}
                                            >
                                                <div className="absolute inset-0 opacity-30" style={{
                                                    backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                                                    backgroundSize: '1rem 1rem'
                                                }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {Number(curve.tradeCount)} trades · {Number(curve.totalVolumeEth).toFixed(3)} ETH vol
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            <style jsx global>{`
                body { background-color: #000; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #0a0a0a; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #444; }
            `}</style>
        </div>
    );
};

export default RobinPumpInterface;
