import React, { useState } from 'react';
import Head from 'next/head';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { networkConfig, MOCK_USDC_ABI } from '@/lib/networkConfig';

const MINT_AMOUNT = parseUnits('1000', 6); // 1000 USDC (6 decimals)

export default function Faucet() {
    const { address, isConnected } = useAccount();
    const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    const { data: hash, writeContract, isPending } = useWriteContract();

    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
        hash,
    });

    const handleMint = async () => {
        if (!address) return;
        setTxStatus('pending');
        try {
            writeContract({
                address: networkConfig.baseSepolia.contracts.MOCK_USDC as `0x${string}`,
                abi: MOCK_USDC_ABI,
                functionName: 'mint',
                args: [address, MINT_AMOUNT],
            });
        } catch {
            setTxStatus('error');
        }
    };

    return (
        <>
            <Head>
                <title>Faucet | PumpFight</title>
                <meta name="description" content="Get test USDC for PumpFight battles" />
            </Head>
            <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black mb-2">
                            Test <span className="text-green-400">USDC</span> Faucet
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            Mint 1,000 mock USDC to your wallet for testing battles on Base Sepolia
                        </p>
                    </div>

                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6 backdrop-blur-md">
                        {/* Token Info */}
                        <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
                                    $
                                </div>
                                <div>
                                    <p className="font-semibold">USD Coin (Mock)</p>
                                    <p className="text-xs text-zinc-500">Base Sepolia Testnet</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-bold text-green-400 text-lg">1,000</p>
                                <p className="text-xs text-zinc-500">USDC per mint</p>
                            </div>
                        </div>

                        {/* Wallet Status */}
                        {!isConnected ? (
                            <div className="flex flex-col items-center gap-4 py-4">
                                <p className="text-zinc-400 text-sm">Connect your wallet to mint</p>
                                <ConnectButton />
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-zinc-800/50 rounded-xl">
                                    <p className="text-xs text-zinc-500 mb-1">Connected Wallet</p>
                                    <p className="font-mono text-sm text-zinc-300 break-all">{address}</p>
                                </div>

                                <button
                                    onClick={handleMint}
                                    disabled={isPending || isConfirming}
                                    className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                                >
                                    {isPending
                                        ? 'Confirm in wallet...'
                                        : isConfirming
                                            ? 'Confirming...'
                                            : 'Mint 1,000 USDC'}
                                </button>

                                {/* Status Messages */}
                                {isSuccess && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                                        <p className="text-green-400 font-semibold text-sm">1,000 USDC minted successfully!</p>
                                        {hash && (
                                            <a
                                                href={`${networkConfig.baseSepolia.blockExplorer}/tx/${hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-green-500 underline mt-1 inline-block"
                                            >
                                                View transaction
                                            </a>
                                        )}
                                    </div>
                                )}

                                {txStatus === 'error' && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
                                        <p className="text-red-400 font-semibold text-sm">Transaction failed. Please try again.</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Contract Info */}
                        <div className="border-t border-zinc-800 pt-4">
                            <p className="text-xs text-zinc-600 text-center">
                                Contract:{' '}
                                <a
                                    href={`${networkConfig.baseSepolia.blockExplorer}/address/${networkConfig.baseSepolia.contracts.MOCK_USDC}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-500 hover:text-zinc-300 underline font-mono"
                                >
                                    {networkConfig.baseSepolia.contracts.MOCK_USDC.slice(0, 6)}...{networkConfig.baseSepolia.contracts.MOCK_USDC.slice(-4)}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
