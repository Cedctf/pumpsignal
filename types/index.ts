export interface Curve {
    id: string;
    createdAt: string;
    token: string;
    name: string;
    symbol: string;
    uri: string;
    creator: string;
    graduated: boolean;
    lastPriceUsd: string;
    lastPriceEth: string;
    totalVolumeEth: string;
    tradeCount: string;
    lastTradeAt: string | null;
}

export interface PumpChartsData {
    data: {
        curves: Curve[];
    };
}
