import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import CoinCard, { CoinData } from './CoinCard';
import BetPanel from './BetPanel';
import { fetchCurves } from '../../lib/goldsky';
import { scoreCurves, rankCurves } from '../../lib/scoring';
import { networkConfig, COIN_BATTLE_ABI } from '../../lib/networkConfig';
import type { Curve } from '../../types';

const BATTLE_ADDRESS = networkConfig.baseSepolia.contracts.COIN_BATTLE as `0x${string}`;
const BATTLE_ID = 0; // first battle

// ── Helpers ───────────────────────────────────────────────

const SUPPLY = 1_000_000_000;

const formatUsd = (n: number): string => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    if (n >= 1) return `$${n.toFixed(2)}`;
    if (n >= 0.0001) return `$${n.toFixed(6)}`;
    return `$${n.toExponential(2)}`;
};

const formatEth = (n: number): string => {
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K ETH`;
    if (n >= 1) return `${n.toFixed(2)} ETH`;
    return `${n.toFixed(4)} ETH`;
};

const timeAgo = (ts: number): string => {
    const secs = Math.floor(Date.now() / 1000 - ts);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
};

const shortAddr = (addr: string): string =>
    addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

/**
 * Convert a Curve from the API into CoinData for the battle card
 */
const curveToCoinData = (c: Curve): CoinData => {
    const priceUsd = Number(c.lastPriceUsd) || 0;
    const priceEth = Number(c.lastPriceEth) || 0;
    const volumeEth = Number(c.totalVolumeEth) || 0;
    const mcap = priceUsd * SUPPLY;

    // Rough ETH/USD from price ratio (guard divide-by-zero)
    const ethUsd = priceEth > 0 ? priceUsd / priceEth : 0;

    // Bonding curve: graduated = 100%, else estimate from volume (85 ETH = 100%)
    const graduated = Boolean(c.graduated);
    const bondingPct = graduated ? 100 : Math.min(100, Math.round((volumeEth / 85) * 100));

    return {
        name: c.name,
        symbol: c.symbol,
        uri: c.uri || '',
        address: shortAddr(c.token || c.id),
        creator: shortAddr(c.creator || ''),
        age: timeAgo(Number(c.createdAt)),
        price: formatUsd(priceUsd),
        priceEth: priceEth.toPrecision(3),
        ethUsd: ethUsd > 0 ? formatUsd(ethUsd) : '—',
        change24h: '+0.0%',           // API doesn't provide 24h change; placeholder
        changeSinceLaunch: '+0.0%',   // same — would need historical data
        marketCap: formatUsd(mcap),
        ath: formatUsd(mcap * 1.5),   // rough estimate (no ATH data in API)
        athProgress: 67,               // placeholder
        volume24h: formatEth(volumeEth),
        bondingCurveProgress: bondingPct,
        bondingCurveEth: `${volumeEth.toFixed(2)} ETH`,
        graduateTarget: graduated ? 'Graduated' : `${(85 - volumeEth).toFixed(1)} ETH to graduate`,
    };
};

// ── Countdown helper ──────────────────────────────────────

const getSecondsToMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.floor((midnight.getTime() - now.getTime()) / 1000);
};

// ── Component ─────────────────────────────────────────────

const BattleArena: React.FC = () => {
    const router = useRouter();
    const leftSymbol = (router.query.left as string || '').toUpperCase();
    const rightSymbol = (router.query.right as string || '').toUpperCase();

    const [allCoins, setAllCoins] = useState<Map<string, CoinData>>(new Map());
    const [defaultPair, setDefaultPair] = useState<[string, string]>(['', '']);
    const [loading, setLoading] = useState(true);

    const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(getSecondsToMidnight());

    // Read on-chain battle data
    const { data: battleData } = useReadContract({
        address: BATTLE_ADDRESS,
        abi: COIN_BATTLE_ABI,
        functionName: 'getBattle',
        args: [BigInt(BATTLE_ID)],
        query: { refetchInterval: 10000 }, // refresh every 10s
    });

    const battle = battleData as { coinA: string; coinB: string; endTime: bigint; totalPoolA: bigint; totalPoolB: bigint; winner: number; status: number } | undefined;

    // Fetch real coins
    useEffect(() => {
        fetchCurves()
            .then((curves: Curve[]) => {
                const scored = scoreCurves(curves);
                const ranked = rankCurves(scored, 'score');

                const coinMap = new Map<string, CoinData>();
                ranked.forEach((c) => {
                    const data = curveToCoinData(c);
                    coinMap.set(c.symbol.toUpperCase(), data);
                });

                setAllCoins(coinMap);

                // Use top 2 as default pair if no query params
                if (ranked.length >= 2) {
                    setDefaultPair([ranked[0].symbol.toUpperCase(), ranked[1].symbol.toUpperCase()]);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Tick countdown every second
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(getSecondsToMidnight());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (s: number) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Resolve coins
    const resolvedLeft = leftSymbol || defaultPair[0];
    const resolvedRight = rightSymbol || defaultPair[1];
    const coinA = allCoins.get(resolvedLeft);
    const coinB = allCoins.get(resolvedRight);

    // Pool values from on-chain data (USDC has 6 decimals)
    const poolLeft = battle ? Number(formatUnits(battle.totalPoolA, 6)) : 0;
    const poolRight = battle ? Number(formatUnits(battle.totalPoolB, 6)) : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-500 text-sm">Loading battle data…</span>
            </div>
        );
    }

    if (!coinA || !coinB) {
        return (
            <div className="text-center py-20 text-zinc-500">
                <p className="text-lg font-semibold mb-2">Coins not found</p>
                <p className="text-sm">
                    Could not find <span className="text-white font-bold">{resolvedLeft || '???'}</span> or <span className="text-white font-bold">{resolvedRight || '???'}</span> in the latest data.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {/* Countdown to next day */}
            <div className="flex justify-center">
                <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-5 py-3">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Round ends in</span>
                    <span className="text-xl font-mono font-bold text-white tracking-widest tabular-nums">
                        {formatTime(secondsLeft)}
                    </span>
                </div>
            </div>

            {/* Battle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-0 items-stretch">
                <div className="flex">
                    <CoinCard coin={coinA} side="left" isSelected={selectedSide === 'left'} onSelect={() => setSelectedSide('left')} />
                </div>

                {/* VS Divider */}
                <div className="flex items-center justify-center md:px-6">
                    <div className="hidden md:flex flex-col items-center gap-3">
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
                        <div className="relative">
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-300 to-purple-400">VS</span>
                            <div className="absolute inset-0 flex items-center justify-center"><div className="w-10 h-10 rounded-full bg-yellow-500/10 animate-ping" /></div>
                        </div>
                        <div className="w-px h-16 bg-gradient-to-b from-transparent via-zinc-600 to-transparent" />
                    </div>
                    <div className="md:hidden flex items-center gap-4 w-full">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-yellow-300 to-purple-400">VS</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
                    </div>
                </div>

                <div className="flex">
                    <CoinCard coin={coinB} side="right" isSelected={selectedSide === 'right'} onSelect={() => setSelectedSide('right')} />
                </div>
            </div>

            {/* Bet Panel */}
            {selectedSide && (
                <div className="animate-fade-in">
                    <BetPanel selectedCoinName={selectedSide === 'left' ? coinA.name : coinB.name} selectedSide={selectedSide} timeInterval={'24H'} poolLeft={poolLeft} poolRight={poolRight} battleId={BATTLE_ID} />
                </div>
            )}

            {!selectedSide && (
                <p className="text-center text-zinc-600 text-sm animate-pulse">Select a coin to place your bet</p>
            )}
        </div>
    );
};

export default BattleArena;
