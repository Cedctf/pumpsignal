import React from 'react';
import Image from 'next/image';

export interface CoinData {
    name: string;
    symbol: string;
    icon: string;
    price: string;
    change24h: string;
    marketCap: string;
    volume24h: string;
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

    return (
        <button
            onClick={onSelect}
            className={`
                relative w-full rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer
                bg-zinc-900/60 backdrop-blur-md border
                hover:scale-[1.02] hover:shadow-2xl
                ${isSelected
                    ? accent === 'blue'
                        ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                        : 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    : 'border-zinc-800 hover:border-zinc-700'
                }
            `}
        >
            {isSelected && (
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${accent === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-purple-500/20 text-purple-400 border border-purple-500/50'}
                `}>
                    Selected
                </div>
            )}

            {/* Coin header */}
            <div className="flex items-center gap-4 mb-6">
                <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${isSelected
                        ? accent === 'blue' ? 'border-blue-500' : 'border-purple-500'
                        : 'border-zinc-700'
                    }`}>
                    <Image src={coin.icon} alt={coin.name} fill className="object-cover" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{coin.name}</h3>
                    <span className="text-sm text-zinc-500 font-semibold">{coin.symbol}</span>
                </div>
            </div>

            {/* Price */}
            <div className="mb-6">
                <p className="text-sm text-zinc-500 mb-1">Current Price</p>
                <p className="text-3xl font-bold text-white tracking-tight">{coin.price}</p>
                <p className={`text-sm font-semibold mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {coin.change24h} (24h)
                </p>
            </div>

            {/* Sparkline bars */}
            <div className="w-full h-12 rounded-lg overflow-hidden bg-zinc-800/50 mb-6 relative">
                <div className={`absolute inset-0 opacity-30 ${isPositive
                        ? 'bg-gradient-to-r from-green-600/0 via-green-500 to-green-600/0'
                        : 'bg-gradient-to-r from-red-600/0 via-red-500 to-red-600/0'
                    }`} style={{ animation: 'shimmer 2s ease-in-out infinite' }} />
                <div className="absolute inset-0 flex items-end justify-around px-1 gap-[2px]">
                    {[40, 55, 35, 65, 50, 70, 45, 80, 60, 75, 55, 85, 70, 90, 65].map((h, i) => (
                        <div
                            key={i}
                            className={`w-full rounded-t-sm ${isPositive ? 'bg-green-500/40' : 'bg-red-500/40'}`}
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-zinc-500 mb-1">Market Cap</p>
                    <p className="text-sm font-semibold text-zinc-300">{coin.marketCap}</p>
                </div>
                <div>
                    <p className="text-xs text-zinc-500 mb-1">24h Volume</p>
                    <p className="text-sm font-semibold text-zinc-300">{coin.volume24h}</p>
                </div>
            </div>
        </button>
    );
};

export default CoinCard;
