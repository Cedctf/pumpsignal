import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Start thinking about icons. Using heroicons for now as they are common.

interface LeaderboardFiltersProps {
    // Add props later if state needs to be lifted
}

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = () => {
    return (
        <div className="flex flex-col gap-4 w-full mb-8">
            {/* Top Row: Time & Search & Metrics */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Time Selector */}
                    <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
                        {['All Time', '1M', '1W', '1D'].map((time, index) => (
                            <button
                                key={time}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${index === 0
                                    ? 'bg-blue-600 text-white'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search coins"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                    </div>
                </div>

                {/* Right Side Metrics Toggles */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
                    <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/50 text-sm font-medium whitespace-nowrap">
                        ↓ Mkt Cap
                    </button>
                    {['24h Vol', 'Liquidity', 'Holders'].map((metric) => (
                        <button
                            key={metric}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 text-sm font-medium whitespace-nowrap hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                        >
                            ↓ {metric}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Row: Style Tags */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
                    <button className="px-4 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                        All Sectors
                    </button>
                </div>
                {['Meme', 'AI', 'DeFi', 'Cat', 'Dog', 'PolitiFi'].map((style) => (
                    <button
                        key={style}
                        className="px-3 py-1 rounded-full text-sm font-medium text-zinc-500 bg-transparent border border-transparent hover:bg-zinc-900 hover:border-zinc-800 hover:text-zinc-300 transition-all"
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LeaderboardFilters;
