import React, { useState } from 'react';

interface BetPanelProps {
    selectedCoinName: string;
    selectedSide: 'left' | 'right';
    timeInterval: string;
    poolLeft: number;
    poolRight: number;
}

const BetPanel: React.FC<BetPanelProps> = ({
    selectedCoinName,
    selectedSide,
    timeInterval,
    poolLeft,
    poolRight,
}) => {
    const [betAmount, setBetAmount] = useState('');
    const [hasPlaced, setHasPlaced] = useState(false);

    const totalPool = poolLeft + poolRight;
    const leftPct = totalPool > 0 ? Math.round((poolLeft / totalPool) * 100) : 50;
    const rightPct = 100 - leftPct;

    const multiplier = selectedSide === 'left'
        ? totalPool > 0 ? (totalPool / poolLeft).toFixed(2) : '2.00'
        : totalPool > 0 ? (totalPool / poolRight).toFixed(2) : '2.00';

    const potentialPayout = betAmount ? (parseFloat(betAmount) * parseFloat(multiplier)).toFixed(2) : '0.00';
    const accent = selectedSide === 'left' ? 'blue' : 'purple';

    const handlePlaceBet = () => {
        if (!betAmount || parseFloat(betAmount) <= 0) return;
        setHasPlaced(true);
    };

    return (
        <div className={`
            w-full max-w-md mx-auto rounded-2xl p-6 border backdrop-blur-md transition-all duration-500 bg-zinc-900/70
            ${accent === 'blue'
                ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                : 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
            }
        `}>
            <div className="text-center mb-6">
                <p className="text-zinc-500 text-sm">You&apos;re betting on</p>
                <p className={`text-xl font-bold mt-1 ${accent === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {selectedCoinName}
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                    to have a higher price in <span className="text-white font-semibold">{timeInterval}</span>
                </p>
            </div>

            {/* Pool Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-zinc-500 mb-2">
                    <span>Pool A · {leftPct}%</span>
                    <span>{rightPct}% · Pool B</span>
                </div>
                <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden flex">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-l-full transition-all duration-700" style={{ width: `${leftPct}%` }} />
                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-r-full transition-all duration-700" style={{ width: `${rightPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-zinc-600 mt-1">
                    <span>{poolLeft.toFixed(1)} SOL</span>
                    <span>{poolRight.toFixed(1)} SOL</span>
                </div>
            </div>

            {hasPlaced ? (
                <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="text-green-400 font-semibold">Bet Placed!</p>
                    <p className="text-zinc-500 text-sm mt-1">{betAmount} SOL on {selectedCoinName}</p>
                    <p className="text-zinc-400 text-xs mt-1">Potential payout: {potentialPayout} SOL</p>
                    <button onClick={() => { setHasPlaced(false); setBetAmount(''); }} className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors cursor-pointer">
                        Place another bet
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="text-xs text-zinc-500 mb-2 block">Bet Amount (SOL)</label>
                        <div className="relative">
                            <input
                                type="number" min="0" step="0.1" value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)} placeholder="0.00"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-lg font-semibold placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                {[0.5, 1, 5].map((amt) => (
                                    <button key={amt} onClick={() => setBetAmount(String(amt))} className="px-2 py-1 text-[10px] rounded-md bg-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-600 transition-colors cursor-pointer">
                                        {amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm mb-4 px-1">
                        <span className="text-zinc-500">Multiplier</span>
                        <span className="text-white font-semibold">{multiplier}×</span>
                    </div>
                    <div className="flex justify-between text-sm mb-6 px-1">
                        <span className="text-zinc-500">Potential Payout</span>
                        <span className="text-green-400 font-semibold">{potentialPayout} SOL</span>
                    </div>
                    <button onClick={handlePlaceBet} disabled={!betAmount || parseFloat(betAmount) <= 0}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
                            ${accent === 'blue'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                            }`}
                    >
                        Place Bet
                    </button>
                </>
            )}
        </div>
    );
};

export default BetPanel;
