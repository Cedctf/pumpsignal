// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title CoinBattle
 * @dev Users bet USDC on which of two coins (A or B) will perform better.
 *      Owner resolves the battle after the round ends.
 *      Winners split the total pool proportionally.
 */
contract CoinBattle {
    address public owner;
    IERC20 public betToken; // USDC (or any ERC20 used for betting)
    IERC20 public rewardToken; // reward token minted on bet

    enum Side {
        None,
        CoinA,
        CoinB
    }
    enum Status {
        Open,
        Resolved,
        Cancelled
    }

    struct Battle {
        string coinA; // symbol of coin A
        string coinB; // symbol of coin B
        uint256 endTime; // timestamp when betting closes
        uint256 totalPoolA; // total USDC bet on coin A
        uint256 totalPoolB; // total USDC bet on coin B
        Side winner; // set after resolution
        Status status;
    }

    struct Bet {
        Side side;
        uint256 amount;
        bool claimed;
    }

    uint256 public rewardRate = 1000; // 1000 reward tokens per 1 USDC
    uint256 public battleCount;
    mapping(uint256 => Battle) public battles;
    mapping(uint256 => mapping(address => Bet)) public bets;

    event BattleCreated(
        uint256 indexed battleId,
        string coinA,
        string coinB,
        uint256 endTime
    );
    event BetPlaced(
        uint256 indexed battleId,
        address indexed user,
        Side side,
        uint256 amount
    );
    event BattleResolved(uint256 indexed battleId, Side winner);
    event BattleCancelled(uint256 indexed battleId);
    event Claimed(
        uint256 indexed battleId,
        address indexed user,
        uint256 payout
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _betToken, address _rewardToken) {
        owner = msg.sender;
        betToken = IERC20(_betToken);
        rewardToken = IERC20(_rewardToken);
    }

    /**
     * @dev Create a new battle between two coins.
     * @param _coinA Symbol of coin A (e.g. "PEPE")
     * @param _coinB Symbol of coin B (e.g. "WIF")
     * @param _duration Seconds until betting closes
     */
    function createBattle(
        string calldata _coinA,
        string calldata _coinB,
        uint256 _duration
    ) external onlyOwner returns (uint256) {
        uint256 id = battleCount++;
        battles[id] = Battle({
            coinA: _coinA,
            coinB: _coinB,
            endTime: block.timestamp + _duration,
            totalPoolA: 0,
            totalPoolB: 0,
            winner: Side.None,
            status: Status.Open
        });
        emit BattleCreated(id, _coinA, _coinB, block.timestamp + _duration);
        return id;
    }

    /**
     * @dev Place a bet on a side. User must approve betToken first.
     * @param _amount Amount of USDC to bet
     */
    function placeBet(uint256 _battleId, Side _side, uint256 _amount) external {
        Battle storage b = battles[_battleId];
        require(b.status == Status.Open, "Battle not open");
        require(block.timestamp < b.endTime, "Betting closed");
        require(_side == Side.CoinA || _side == Side.CoinB, "Invalid side");
        require(_amount > 0, "Amount must be > 0");

        // If user already bet, ensure they stick to the same side
        if (bets[_battleId][msg.sender].amount > 0) {
            require(
                bets[_battleId][msg.sender].side == _side,
                "Cannot switch sides"
            );
        }

        // Transfer USDC from user to this contract
        require(
            betToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        Bet storage userBet = bets[_battleId][msg.sender];

        // Initialize side if this is the first bet
        if (userBet.amount == 0) {
            userBet.side = _side;
        }

        // Accumulate amount
        userBet.amount += _amount;
        // Ensure not claimed (though should be false anyway for open battle)
        userBet.claimed = false;

        if (_side == Side.CoinA) {
            b.totalPoolA += _amount;
        } else {
            b.totalPoolB += _amount;
        }

        // Mint reward tokens to the bettor (rewardRate:1 with bet)
        // Mint based on the *new* amount being added
        rewardToken.mint(msg.sender, _amount * rewardRate);

        emit BetPlaced(_battleId, msg.sender, _side, _amount);
    }

    /**
     * @dev Owner resolves the battle by declaring the winning side.
     */
    function resolveBattle(uint256 _battleId, Side _winner) external onlyOwner {
        Battle storage b = battles[_battleId];
        require(b.status == Status.Open, "Not open");
        require(block.timestamp >= b.endTime, "Not ended yet");
        require(
            _winner == Side.CoinA || _winner == Side.CoinB,
            "Invalid winner"
        );

        b.winner = _winner;
        b.status = Status.Resolved;

        emit BattleResolved(_battleId, _winner);
    }

    /**
     * @dev Cancel a battle. All bettors can claim refunds.
     */
    function cancelBattle(uint256 _battleId) external onlyOwner {
        Battle storage b = battles[_battleId];
        require(b.status == Status.Open, "Not open");
        b.status = Status.Cancelled;
        emit BattleCancelled(_battleId);
    }

    /**
     * @dev Update the reward token rate (tokens minted per 1 USDC bet).
     */
    function setRewardRate(uint256 _rate) external onlyOwner {
        require(_rate > 0, "Rate must be > 0");
        rewardRate = _rate;
    }

    /**
     * @dev Claim winnings (or refund if cancelled).
     */
    function claim(uint256 _battleId) external {
        Battle storage b = battles[_battleId];
        Bet storage userBet = bets[_battleId][msg.sender];

        require(userBet.amount > 0, "No bet found");
        require(!userBet.claimed, "Already claimed");

        uint256 payout;

        if (b.status == Status.Cancelled) {
            // Refund
            payout = userBet.amount;
        } else if (b.status == Status.Resolved) {
            require(userBet.side == b.winner, "You lost");
            // Winner gets proportional share of total pool
            uint256 totalPool = b.totalPoolA + b.totalPoolB;
            uint256 winningPool = b.winner == Side.CoinA
                ? b.totalPoolA
                : b.totalPoolB;
            payout = (userBet.amount * totalPool) / winningPool;
        } else {
            revert("Battle not resolved");
        }

        userBet.claimed = true;
        require(betToken.transfer(msg.sender, payout), "Payout failed");

        emit Claimed(_battleId, msg.sender, payout);
    }

    /**
     * @dev View helpers
     */
    function getBattle(
        uint256 _battleId
    ) external view returns (Battle memory) {
        return battles[_battleId];
    }

    function getUserBet(
        uint256 _battleId,
        address _user
    ) external view returns (Bet memory) {
        return bets[_battleId][_user];
    }
}
