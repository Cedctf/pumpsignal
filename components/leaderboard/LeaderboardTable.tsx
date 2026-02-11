import React from 'react';
import Image from 'next/image';

interface Coin {
    rank: number;
    name: string;
    symbol: string;
    icon: string; // URL to coin icon
    price: string;
    marketCap: string;
    volume24h: string;
    change24h: string;
    holders: string;
    tags: string[];
}

const mockCoins: Coin[] = [
    {
        rank: 1,
        name: 'Pepe',
        symbol: 'PEPE',
        icon: 'https://ui-avatars.com/api/?name=Pepe&background=4ADE80&color=fff',
        price: '$0.00000823',
        marketCap: '$3.45B',
        volume24h: '$840.2M',
        change24h: '+12.5%',
        holders: '154.2K',
        tags: ['Meme', 'Frog'],
    },
    {
        rank: 2,
        name: 'Wif',
        symbol: 'WIF',
        icon: 'https://ui-avatars.com/api/?name=Wif&background=FCD34D&color=fff',
        price: '$2.45',
        marketCap: '$2.45B',
        volume24h: '$420.5M',
        change24h: '+8.2%',
        holders: '85.1K',
        tags: ['Meme', 'Dog'],
    },
    {
        rank: 3,
        name: 'Bonk',
        symbol: 'BONK',
        icon: 'https://ui-avatars.com/api/?name=Bonk&background=EA580C&color=fff',
        price: '$0.0000241',
        marketCap: '$1.62B',
        volume24h: '$180.3M',
        change24h: '-2.4%',
        holders: '620.5K',
        tags: ['Meme', 'Dog'],
    },
    {
        rank: 4,
        name: 'Popcat',
        symbol: 'POPCAT',
        icon: 'https://ui-avatars.com/api/?name=Popcat&background=F8FAFC&color=000',
        price: '$0.42',
        marketCap: '$420.0M',
        volume24h: '$45.2M',
        change24h: '+24.1%',
        holders: '32.4K',
        tags: ['Meme', 'Cat'],
    },
    {
        rank: 5,
        name: 'Mog',
        symbol: 'MOG',
        icon: 'https://ui-avatars.com/api/?name=Mog&background=3B82F6&color=fff',
        price: '$0.0000012',
        marketCap: '$380.5M',
        volume24h: '$32.1M',
        change24h: '+5.6%',
        holders: '24.8K',
        tags: ['Meme', 'Cat'],
    },
    {
        rank: 6,
        name: 'Gigachad',
        symbol: 'GIGA',
        icon: 'https://ui-avatars.com/api/?name=Giga&background=57534E&color=fff',
        price: '$0.042',
        marketCap: '$120.4M',
        volume24h: '$12.5M',
        change24h: '+15.3%',
        holders: '12.1K',
        tags: ['Meme', 'Gym'],
    }
];

const LeaderboardTable: React.FC = () => {
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
                <thead>
                    <tr className="text-zinc-500 text-sm border-b border-zinc-800">
                        <th className="py-4 text-left font-medium pl-4 w-16">Rank</th>
                        <th className="py-4 text-left font-medium">Coin</th>
                        <th className="py-4 text-right font-medium">Price</th>
                        <th className="py-4 text-right font-medium">Market Cap</th>
                        <th className="py-4 text-right font-medium">24h Vol</th>
                        <th className="py-4 text-right font-medium">Holders</th>
                        <th className="py-4 text-right font-medium pr-4">24h Change</th>
                    </tr>
                </thead>
                <tbody>
                    {mockCoins.map((coin) => (
                        <tr key={coin.rank} className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors group">
                            {/* Rank */}
                            <td className="py-6 pl-4">
                                <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm ${coin.rank === 1
                                        ? 'bg-yellow-500 text-black'
                                        : coin.rank === 2
                                            ? 'bg-zinc-300 text-black'
                                            : coin.rank === 3
                                                ? 'bg-orange-600 text-white'
                                                : 'text-zinc-400 bg-zinc-800/50'
                                        }`}
                                >
                                    {coin.rank}
                                </div>
                            </td>

                            {/* Coin Info */}
                            <td className="py-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800 font-bold text-lg flex items-center justify-center text-zinc-400 border border-zinc-700">
                                        <Image src={coin.icon} alt={coin.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-zinc-200">{coin.name}</span>
                                            <span className="text-xs text-zinc-500 font-bold">{coin.symbol}</span>
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            {coin.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[10px] px-1.5 py-0.5 rounded border bg-zinc-800 text-zinc-400 border-zinc-700"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Price */}
                            <td className="py-6 text-right font-medium text-zinc-300">
                                {coin.price}
                            </td>

                            {/* Market Cap */}
                            <td className="py-6 text-right font-medium text-zinc-300">
                                {coin.marketCap}
                            </td>

                            {/* Volume */}
                            <td className="py-6 text-right font-medium text-zinc-400">
                                {coin.volume24h}
                            </td>

                            {/* Holders */}
                            <td className="py-6 text-right font-medium text-zinc-400">
                                {coin.holders}
                            </td>

                            {/* 24h Change */}
                            <td className={`py-6 text-right font-semibold pr-4 ${coin.change24h.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                                {coin.change24h}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaderboardTable;
