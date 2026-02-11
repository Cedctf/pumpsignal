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
                    to have a higher price in <span className="text-white font-semibold font-mono">{formatTime(secondsLeft)}</span>
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
                    <span>{leftPrice.toFixed(2)} USDC / Share</span>
                    <span>{rightPrice.toFixed(2)} USDC / Share</span>
                </div>
            </div>

            {/* Wallet not connected */}
            {!isConnected ? (
                <div className="flex flex-col items-center gap-4 py-4">
                    <p className="text-zinc-400 text-sm">Connect your wallet to bet</p>
                    <ConnectButton />
                </div>
            ) : step === 'success' ? (
                /* Success state */
                <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="text-green-400 font-semibold">Bet Placed!</p>
                    <p className="text-zinc-500 text-sm mt-1">{betAmount} USDC on {selectedCoinName}</p>
                    <p className="text-zinc-400 text-xs mt-1">Potential payout: {potentialPayout} USDC</p>
                    <p className="text-yellow-400 text-xs mt-1">🎉 +{cbaReward} CBA reward tokens minted!</p>
                    {betHash && (
                        <a
                            href={`${networkConfig.baseSepolia.blockExplorer}/tx/${betHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 underline mt-2 inline-block"
                        >
                            View transaction ↗
                        </a>
                    )}
                    <button onClick={handleReset} className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors cursor-pointer block mx-auto">
                        Place Another Bet
                    </button>
                </div>
            ) : (
                <>
                    {/* Existing Bet Summary */}
                    {hasExistingBet && (
                        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex flex-shrink-0 items-center justify-center">
                                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">Current Position</p>
                                <p className="text-white text-sm">
                                    {formatUnits(existingBet!.amount, USDC_DECIMALS)} USDC on {existingBet!.side === 1 ? 'Coin A' : 'Coin B'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Wrong Side Warning */}
                    {hasExistingBet && existingBet!.side !== side && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                            <p className="text-red-400 text-sm">
                                You cannot bet on both sides. <br />
                                Switch to {existingBet!.side === 1 ? 'Coin A' : 'Coin B'} to add to your position.
                            </p>
                        </div>
                    )}

                    {/* Bet input */}
                    <div className={`mb-4 ${hasExistingBet && existingBet!.side !== side ? 'opacity-50 pointer-events-none' : ''}`}>
                        <label className="text-xs text-zinc-500 mb-2 block">
                            {hasExistingBet ? 'Add to Bet (USDC)' : 'Bet Amount (USDC)'}
                        </label>
                        <div className="relative">
                            <input
                                type="number" min="0" step="1" value={betAmount}
                                onChange={(e) => setBetAmount(e.target.value)} placeholder="0.00"
                                disabled={isProcessing}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 px-4 text-white text-lg font-semibold placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                                {[10, 50, 100].map((amt) => (
                                    <button key={amt} onClick={() => setBetAmount(String(amt))} disabled={isProcessing} className="px-2 py-1 text-[10px] rounded-md bg-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-600 transition-colors cursor-pointer disabled:opacity-50">
                                        {amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-zinc-500 text-center mb-4 italic">
                        *50% of deposit is added to the pool, 50% goes to the Treasury.
                    </p>

                    {/* Stats */}
                    <div className="flex justify-between text-sm mb-2 px-1">
                        <span className="text-zinc-500">Multiplier</span>
                        <span className="text-white font-semibold">{multiplier}×</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2 px-1">
                        <span className="text-zinc-500">Prediction Price</span>
                        <span className="text-white font-semibold">{(1 / parseFloat(multiplier)).toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2 px-1">
                        <span className="text-zinc-500">Potential Payout</span>
                        <span className="text-green-400 font-semibold">{potentialPayout} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm mb-6 px-1">
                        <span className="text-zinc-500">CBA Reward</span>
                        <span className="text-yellow-400 font-semibold">+{cbaReward} CBA</span>
                    </div>

                    {/* Place Bet button */}
                    <button onClick={handlePlaceBet} disabled={!betAmount || parseFloat(betAmount) <= 0 || isProcessing || (hasExistingBet && existingBet!.side !== side)}
                        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed
                            ${accent === 'blue'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                            }`}
                    >
                        {getButtonLabel()}
                    </button>

                    {/* Error */}
                    {step === 'error' && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                            <p className="text-red-400 text-sm font-medium">{errorMsg || 'Transaction failed. Please try again.'}</p>
                            <button onClick={handleReset} className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 underline cursor-pointer">
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Processing status */}
                    {isProcessing && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-zinc-400">
                                {isApprovePending || isApproveConfirming ? 'Approving USDC...' : 'Placing bet...'}
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BetPanel;
