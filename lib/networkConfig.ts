// Network configuration for PumpFight
// Update contract addresses here after deployment

export const networkConfig = {
    baseSepolia: {
        chainId: 84532,
        name: 'Base Sepolia',
        rpcUrl: 'https://sepolia.base.org',
        blockExplorer: 'https://sepolia.basescan.org',
        contracts: {
            MOCK_USDC: '0x0565ea3C8b2700e0b35197dF0258eA3A177930B9', // Deployed on Base Sepolia (6 decimals)
            CBA: '0x9812E5fd8c1fFD85ea3e81724596c9025C80D171', // CBA Token (18 decimals)
            ZERO: '0xeDcAAf9De66528B73cA6dE16A1419658f4E3D873', // ZERO Token (18 decimals)
            COIN_BATTLE: '0x68b817C0056B815e9280de759B33835CDabff6C4', // CoinBattle contract
        },
    },
} as const;

// ABI for the mock USDC (ERC20) mint function
export const MOCK_USDC_ABI = [
    {
        name: 'mint',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        name: 'balanceOf',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'symbol',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
    },
    {
        name: 'decimals',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint8' }],
    },
    {
        name: 'name',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'string' }],
    },
] as const;

// ABI for ERC20 approve + allowance (needed before placing a bet)
export const ERC20_APPROVE_ABI = [
    {
        name: 'approve',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'bool' }],
    },
    {
        name: 'allowance',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;

// ABI for the CoinBattle contract
export const COIN_BATTLE_ABI = [
    {
        name: 'placeBet',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: '_battleId', type: 'uint256' },
            { name: '_side', type: 'uint8' },
            { name: '_amount', type: 'uint256' },
        ],
        outputs: [],
    },
    {
        name: 'getBattle',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: '_battleId', type: 'uint256' }],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'coinA', type: 'string' },
                    { name: 'coinB', type: 'string' },
                    { name: 'endTime', type: 'uint256' },
                    { name: 'totalPoolA', type: 'uint256' },
                    { name: 'totalPoolB', type: 'uint256' },
                    { name: 'winner', type: 'uint8' },
                    { name: 'status', type: 'uint8' },
                ],
            },
        ],
    },
    {
        name: 'getUserBet',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            { name: '_battleId', type: 'uint256' },
            { name: '_user', type: 'address' },
        ],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'side', type: 'uint8' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'claimed', type: 'bool' },
                ],
            },
        ],
    },
    {
        name: 'battleCount',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
    {
        name: 'rewardRate',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
    },
] as const;
