const networkConfig = {
    31377: {
        name: "localhost",
    },
    4: {
        name: "rinkeby",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
}

const devChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INIT_ANSWER = 200000000000

module.exports = {
    networkConfig,
    devChains,
    DECIMALS,
    INIT_ANSWER,
}
