import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                {/* Logo + App Name */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.3)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-shadow">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">
                        Pump<span className="text-green-400">Fight</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/bracket" className="text-sm text-zinc-400 hover:text-white font-semibold transition-colors">
                        Tournament
                    </Link>
                    <Link href="/battle" className="text-sm text-zinc-400 hover:text-white font-semibold transition-colors">
                        Battle
                    </Link>
                    <Link href="/leaderboard" className="text-sm text-zinc-400 hover:text-white font-semibold transition-colors">
                        Top Coins
                    </Link>
                </nav>

                {/* Connect Wallet */}
                <ConnectButton/>
            </div>
        </header>
    );
};

export default Header;
