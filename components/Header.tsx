import React, { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Swords, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-emerald-500/10 bg-black/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                        <div className="p-2 bg-emerald-500 rounded-lg group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                            <Swords className="w-6 h-6 text-black" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-emerald-500 uppercase italic">PumpFight</span>
                    </Link>

                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/bracket" className="text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors">Tournament</Link>
                        <Link href="/battle" className="text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors">Battle</Link>
                        <Link href="/leaderboard" className="text-sm font-medium text-zinc-300 hover:text-emerald-400 transition-colors">Top Coins</Link>
                        <ConnectButton chainStatus="icon" accountStatus="avatar" showBalance={false} />
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-emerald-500">
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-zinc-950 border-b border-emerald-500/20 px-4 py-4 space-y-4">
                    <Link href="/bracket" className="block text-lg font-medium text-zinc-300 hover:text-emerald-400 py-2">Tournament</Link>
                    <Link href="/battle" className="block text-lg font-medium text-zinc-300 hover:text-emerald-400 py-2">Battle</Link>
                    <Link href="/leaderboard" className="block text-lg font-medium text-zinc-300 hover:text-emerald-400 py-2">Top Coins</Link>
                    <div className="w-full flex justify-center py-2">
                        <ConnectButton chainStatus="icon" accountStatus="avatar" showBalance={false} />
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Header;
