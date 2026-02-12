import { Curve } from '../types';

// ── Scoring Engine ───────────────────────────────────────

export interface ScoredCurve extends Curve {
    score: number;
    velocity: number;       // trades per hour
    estimatedMcUsd: number; // price × 1B
    volumeEth: number;
    trades: number;
    isHot: boolean;
    isDead: boolean;
    tier: 'hot' | 'rising' | 'active' | 'dead';
}

const SUPPLY = 1_000_000_000; // assume 1B supply for MC estimate

/**
 * Calculate trading velocity (trades per hour since creation)
 */
const getVelocity = (curve: Curve): number => {
    const now = Date.now() / 1000;
    const ageHours = (now - Number(curve.createdAt)) / 3600;
    if (ageHours <= 0) return 0;
    return Number(curve.tradeCount) / ageHours;
};

/**
 * Check if token was traded recently (within last N hours)
 */
const isRecentlyTraded = (curve: Curve, withinHours: number = 1): boolean => {
    if (!curve.lastTradeAt) return false;
    const now = Date.now() / 1000;
    const hoursSinceLastTrade = (now - Number(curve.lastTradeAt)) / 3600;
    return hoursSinceLastTrade <= withinHours;
};

/**
 * Normalize a value to 0–1 range given min and max
 */
const normalize = (value: number, min: number, max: number): number => {
    if (max === min) return 0;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

/**
 * Assign a tier label based on conditions
 */
const getTier = (velocity: number, volumeEth: number, lastTradeAt: string | null): ScoredCurve['tier'] => {
    const now = Date.now() / 1000;
    const hoursSinceLastTrade = lastTradeAt ? (now - Number(lastTradeAt)) / 3600 : Infinity;

    if (hoursSinceLastTrade > 6) return 'dead';
    if (velocity > 5 && volumeEth > 0.5) return 'hot';
    if (velocity > 1 || volumeEth > 0.1) return 'rising';
    return 'active';
};

/**
 * Score all curves with composite ranking
 * Weights: Velocity 40%, Volume 30%, Trades 20%, Recency 10%
 */
export const scoreCurves = (curves: Curve[]): ScoredCurve[] => {
    // Pre-compute raw values
    const raw = curves.map((c) => ({
        curve: c,
        velocity: getVelocity(c),
        volumeEth: Number(c.totalVolumeEth),
        trades: Number(c.tradeCount),
        estimatedMcUsd: Number(c.lastPriceUsd) * SUPPLY,
        recentlyTraded: isRecentlyTraded(c, 1),
    }));

    // Find min/max for normalization
    const velocities = raw.map((r) => r.velocity);
    const volumes = raw.map((r) => r.volumeEth);
    const tradeCounts = raw.map((r) => r.trades);

    const minVel = Math.min(...velocities), maxVel = Math.max(...velocities);
    const minVol = Math.min(...volumes), maxVol = Math.max(...volumes);
    const minTrades = Math.min(...tradeCounts), maxTrades = Math.max(...tradeCounts);

    return raw.map((r) => {
        const normVelocity = normalize(r.velocity, minVel, maxVel);
        const normVolume = normalize(r.volumeEth, minVol, maxVol);
        const normTrades = normalize(r.trades, minTrades, maxTrades);
        const recencyBonus = r.recentlyTraded ? 1 : 0;

        const score = (normVelocity * 0.4) + (normVolume * 0.3) + (normTrades * 0.2) + (recencyBonus * 0.1);

        const tier = getTier(r.velocity, r.volumeEth, r.curve.lastTradeAt);

        return {
            ...r.curve,
            score,
            velocity: r.velocity,
            estimatedMcUsd: r.estimatedMcUsd,
            volumeEth: r.volumeEth,
            trades: r.trades,
            isHot: tier === 'hot',
            isDead: tier === 'dead',
            tier,
        };
    });
};

export type SortMode = 'score' | 'volume' | 'velocity' | 'marketcap';

/**
 * Rank scored curves by the chosen sort mode
 */
export const rankCurves = (scored: ScoredCurve[], sortMode: SortMode = 'score'): ScoredCurve[] => {
    return [...scored].sort((a, b) => {
        switch (sortMode) {
            case 'volume': return b.volumeEth - a.volumeEth;
            case 'velocity': return b.velocity - a.velocity;
            case 'marketcap': return b.estimatedMcUsd - a.estimatedMcUsd;
            case 'score':
            default: return b.score - a.score;
        }
    });
};
