
export const GOLDSKY_ENDPOINT = "https://api.goldsky.com/api/public/project_cmjjrebt3mxpt01rm9yi04vqq/subgraphs/pump-charts/v2/gn";

export const LATEST_CURVES_QUERY = `
  query LatestCurves($first: Int!) {
    curves(first: $first, orderBy: createdAt, orderDirection: desc) {
      id
      createdAt
      token
      name
      symbol
      uri
      creator
      graduated
      lastPriceUsd
      lastPriceEth
      totalVolumeEth
      tradeCount
      lastTradeAt
    }
  }
`;

export const fetchCurves = async () => {
    const response = await fetch(GOLDSKY_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: LATEST_CURVES_QUERY,
            variables: { first: 50 },
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch curves");
    }

    const result = await response.json();
    return result.data.curves;
};
