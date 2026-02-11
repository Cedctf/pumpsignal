import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { networkConfig, ERC20_APPROVE_ABI, COIN_BATTLE_ABI } from '@/lib/networkConfig';

const USDC_ADDRESS = networkConfig.baseSepolia.contracts.MOCK_USDC as `0x${string}`;
const BATTLE_ADDRESS = networkConfig.baseSepolia.contracts.COIN_BATTLE as `0x${string}`;
const USDC_DECIMALS = 6;

interface BetPanelProps {
    selectedCoinName: string;
    selectedSide: 'left' | 'right';
    timeInterval: string;
    poolLeft: number;
    poolRight: number;
    battleId: number;
    secondsLeft: number;
}

type Step = 'input' | 'approving' | 'betting' | 'success' | 'error';

const BetPanel: React.FC<BetPanelProps> = ({
    selectedCoinName,
    selectedSide,
    timeInterval,
    poolLeft,
    poolRight,
    battleId,
    secondsLeft,
}) => {
    const { address, isConnected } = useAccount();
    const [betAmount, setBetAmount] = useState('');
    const [step, setStep] = useState<Step>('input');
    const [errorMsg, setErrorMsg] = useState('');

    // Override props with hardcoded values for demo/visuals
    const displayPoolLeft = 12540.00;
    const displayPoolRight = 8320.00;

    const totalPool = displayPoolLeft + displayPoolRight;
    const leftPct = totalPool > 0 ? Math.round((displayPoolLeft / totalPool) * 100) : 50;
    const rightPct = 100 - leftPct;

    // Price per share (Probability)
    const leftPrice = totalPool > 0 ? displayPoolLeft / totalPool : 0.5;
    const rightPrice = totalPool > 0 ? displayPoolRight / totalPool : 0.5;

    const multiplier = selectedSide === 'left'
        ? totalPool > 0 ? (totalPool / displayPoolLeft).toFixed(2) : '2.00'
        : totalPool > 0 ? (totalPool / displayPoolRight).toFixed(2) : '2.00';

    // 50% to Treasury, 50% to Pool
    const effectiveBet = betAmount ? parseFloat(betAmount) / 2 : 0;

    // Payout based on effective bet
    const potentialPayout = effectiveBet ? (effectiveBet * parseFloat(multiplier)).toFixed(2) : '0.00';

    // Reward based on effective bet (1000 CBA per 1 USDC of effective bet)
    const cbaReward = effectiveBet ? (effectiveBet * 1000).toLocaleString() : '0';

    const accent = selectedSide === 'left' ? 'blue' : 'purple';
    const side = selectedSide === 'left' ? 1 : 2; // CoinA = 1, CoinB = 2

    // Helper to format time
    const formatTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // ── Read existing user bet ──────────────────────────────
    const { data: userBetData } = useReadContract({
        address: BATTLE_ADDRESS,
        abi: COIN_BATTLE_ABI,
        functionName: 'getUserBet',
        args: address ? [BigInt(battleId), address] : undefined,
        query: { enabled: !!address },
    });

    const existingBet = userBetData as { side: number; amount: bigint; claimed: boolean } | undefined;
    const hasExistingBet = existingBet && existingBet.amount > BigInt(0);

    // ── Read allowance ──────────────────────────────────────
    const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
        address: USDC_ADDRESS,
        abi: ERC20_APPROVE_ABI,
        functionName: 'allowance',
        args: address ? [address, BATTLE_ADDRESS] : undefined,
        query: { enabled: !!address },
    });

    const currentAllowance = (allowanceData as bigint) || BigInt(0);

    // ── Approve USDC tx ─────────────────────────────────────
    const {
        data: approveHash,
        writeContract: writeApprove,
        isPending: isApprovePending,
        reset: resetApprove,
    } = useWriteContract();

    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
        hash: approveHash,
    });

    // ── PlaceBet tx ─────────────────────────────────────────
    const {
        data: betHash,
        writeContract: writeBet,
        isPending: isBetPending,
        reset: resetBet,
    } = useWriteContract();

    const { isLoading: isBetConfirming, isSuccess: isBetSuccess } = useWaitForTransactionReceipt({
        hash: betHash,
    });

    // ── After approve confirmed, auto-trigger placeBet ──────
    useEffect(() => {
        if (isApproveSuccess && step === 'approving' && betAmount) {
            refetchAllowance();
            setStep('betting');
            const amountWei = parseUnits(betAmount, USDC_DECIMALS);
            try {
                writeBet({
                    address: BATTLE_ADDRESS,
                    abi: COIN_BATTLE_ABI,
                    functionName: 'placeBet',
                    args: [BigInt(battleId), side, amountWei],
                });
            } catch {
                setStep('error');
                setErrorMsg('Failed to place bet.');
            }
        }
    }, [isApproveSuccess]);

    // ── After bet confirmed, show success ───────────────────
    useEffect(() => {
        if (isBetSuccess && step === 'betting') {
            setStep('success');
        }
    }, [isBetSuccess]);

    // ── Handlers ────────────────────────────────────────────
    const handlePlaceBet = () => {
        if (!betAmount || parseFloat(betAmount) <= 0 || !address) return;
        setErrorMsg('');

        const amountWei = parseUnits(betAmount, USDC_DECIMALS);

        // Check if we need approval
        if (currentAllowance < amountWei) {
            setStep('approving');
            try {
                writeApprove({
                    address: USDC_ADDRESS,
                    abi: ERC20_APPROVE_ABI,
                    functionName: 'approve',
                    args: [BATTLE_ADDRESS, amountWei],
                });
            } catch {
                setStep('error');
                setErrorMsg('Approval failed.');
            }
        } else {
            // Already approved, go straight to bet
            setStep('betting');
            try {
                writeBet({
                    address: BATTLE_ADDRESS,
                    abi: COIN_BATTLE_ABI,
                    functionName: 'placeBet',
                    args: [BigInt(battleId), side, amountWei],
                });
            } catch {
                setStep('error');
                setErrorMsg('Failed to place bet.');
            }
        }
    };

    const handleReset = () => {
        setStep('input');
        setBetAmount('');
        setErrorMsg('');
        resetApprove();
        resetBet();
    };

    // ── Rendering ───────────────────────────────────────────
    const isProcessing = isApprovePending || isApproveConfirming || isBetPending || isBetConfirming;

    const getButtonLabel = () => {
        if (isApprovePending) return 'Approve in wallet...';
        if (isApproveConfirming) return 'Confirming approval...';
        if (isBetPending) return 'Confirm bet in wallet...';
        if (isBetConfirming) return 'Confirming bet...';
        return 'Place Bet';
    };

    const accentColor = selectedSide === 'left' ? 'emerald' : 'rose';
    const accentText = selectedSide === 'left' ? 'text-emerald-500' : 'text-rose-500';
    const accentBg = selectedSide === 'left' ? 'bg-emerald-500' : 'bg-rose-500';
    const accentBorder = selectedSide === 'left' ? 'border-emerald-500' : 'border-rose-500';
    const accentShadow = selectedSide === 'left' ? 'shadow-emerald-500/20' : 'shadow-rose-500/20';

    return (
        <div className={`
            w-full max-w-md mx-auto rounded-3xl p-8 border backdrop-blur-xl transition-all duration-500 bg-zinc-950/90
            ${selectedSide === 'left'
                ? 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.1)]'
                : 'border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.1)]'
            }
        `}>
            {/* Header */}
            <div className="text-center mb-8 relative">
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 w-24 h-1 bg-${accentColor}-500/20 blur-3xl rounded-full pointer-events-none`} />

                <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">You are backing</h3>
                <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${accentText} drop-shadow-sm`}>
                    {selectedCoinName}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Time Remaining</span>
                    <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-white font-mono font-bold text-xs">{formatTime(secondsLeft)}</span>
                </div>
            </div>

            {/* Pool Bar */}
            <div className="mb-8 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    <span className="text-emerald-500">Pool A · {leftPct}%</span>
                    <span className="text-rose-500">{rightPct}% · Pool B</span>
                </div>
                <div className="w-full h-4 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden flex relative">
                    <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-700 relative z-10" style={{ width: `${leftPct}%` }}>
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />
                    </div>
                    <div className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-700 relative z-10" style={{ width: `${rightPct}%` }}>
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:10px_10px]" />
                    </div>
                </div>
                <div className="flex justify-between text-[10px] font-mono font-medium text-zinc-400 mt-2">
                    <span>{leftPrice.toFixed(2)} USDC/SHARE</span>
                    <span>{rightPrice.toFixed(2)} USDC/SHARE</span>
                </div>
            </div>

            {/* Wallet not connected */}
            {!isConnected ? (
                <div className="flex flex-col items-center gap-6 py-6 border-t border-zinc-800/50">
                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-wide">Connect wallet to fight</p>
                    <ConnectButton />
                </div>
            ) : step === 'success' ? (
                /* Success state */
                <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-black italic uppercase text-white mb-1">Bet Secured!</h3>
                    <p className="text-zinc-500 text-sm font-medium mb-4">{betAmount} USDC on {selectedCoinName}</p>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold uppercase text-zinc-500">Payout Potential</span>
                            <span className="text-emerald-400 font-mono font-bold">{potentialPayout} USDC</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase text-zinc-500">CBA Reward</span>
                            <span className="text-yellow-500 font-mono font-bold">+{cbaReward} CBA</span>
                        </div>
                    </div>

                    {betHash && (
                        <a
                            href={`${networkConfig.baseSepolia.blockExplorer}/tx/${betHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/30 hover:decoration-emerald-500 transition-all"
                        >
                            View Transaction ↗
                        </a>
                    )}

                    <button onClick={handleReset} className="mt-8 text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors cursor-pointer block mx-auto">
                        Place Another Bet
                    </button>
                </div>
            ) : (
                <>
                    {/* Existing Bet Summary */}
                    {hasExistingBet && (
                        <div className="mb-6 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex flex-shrink-0 items-center justify-center border border-yellow-500/20">
                                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-0.5">Current Position</p>
                                <p className="text-zinc-300 text-sm font-bold">
                                    {formatUnits(existingBet!.amount, USDC_DECIMALS)} USDC on {existingBet!.side === 1 ? 'Coin A' : 'Coin B'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Wrong Side Warning */}
                    {hasExistingBet && existingBet!.side !== side && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                            <p className="text-red-400 text-xs font-bold uppercase tracking-wide">
                                You cannot bet on both sides.
                            </p>
                            <p className="text-red-500/60 text-[10px] uppercase font-bold mt-1">
                                Switch sides to add to your position.
                            </p>
                        </div>
                    )}

                    {/* Bet input */}
                    <div className={`mb-6 ${hasExistingBet && existingBet!.side !== side ? 'opacity-50 pointer-events-none' : ''}`}>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 block pl-1">
                            {hasExistingBet ? 'Increse Position (USDC)' : 'Wager Amount (USDC)'}
                        </label>
                        <div className="relative group">
                            <input
                                type="number" min="0" step="1" value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)} placeholder="0.00"
                                disabled={isProcessing}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-white text-2xl font-black italic focus:outline-none focus:border-zinc-700 transition-all disabled:opacity-50 placeholder-zinc-800"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
                                {[10, 50, 100].map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => setBetAmount(String(amt))}
                                        disabled={isProcessing}
                                        className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-zinc-600 text-center mb-6 font-medium">
                        *50% TO POOL · 50% TO TREASURY · WINNER TAKES ALL
                    </p>

                    {/* Stats */}
                    <div className="space-y-3 mb-8 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/30">
                        <div className="flex justify-between text-sm px-1">
                            <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider pt-0.5">Multiplier</span>
                            <span className="text-white font-black italic">{multiplier}×</span>
                        </div>
                        <div className="flex justify-between text-sm px-1">
                            <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider pt-0.5">Est. Payout</span>
                            <span className={`${accentText} font-black italic`}>{potentialPayout} USDC</span>
                        </div>
                        <div className="flex justify-between text-sm px-1 pt-2 border-t border-dashed border-zinc-800">
                            <span className="text-zinc-500 font-bold uppercase text-xs tracking-wider pt-0.5">CBA Reward</span>
                            <span className="text-yellow-500 font-black italic">+{cbaReward} CBA</span>
                        </div>
                    </div>

                    {/* Place Bet button */}
                    <button onClick={handlePlaceBet} disabled={!betAmount || parseFloat(betAmount) <= 0 || isProcessing || (hasExistingBet && existingBet!.side !== side)}
                        className={`w-full py-4 rounded-xl font-black text-lg italic uppercase tracking-tighter transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 group relative overflow-hidden
                            ${accentBg} text-black hover:brightness-110 shadow-lg ${accentShadow}
                        `}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {getButtonLabel()}
                            {!isProcessing && <span className="text-xl">→</span>}
                        </span>
                    </button>

                    {/* Error */}
                    {step === 'error' && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center animate-shake">
                            <p className="text-red-400 text-xs font-bold uppercase tracking-wide">{errorMsg || 'Transaction Failed'}</p>
                            <button onClick={handleReset} className="mt-1 text-[10px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer font-bold uppercase">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Processing status */}
                    {isProcessing && (
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <div className={`w-4 h-4 border-2 ${accentBorder} border-t-transparent rounded-full animate-spin`} />
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                                {isApprovePending || isApproveConfirming ? 'Confirm Approval...' : 'Confirming Bet...'}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BetPanel;
