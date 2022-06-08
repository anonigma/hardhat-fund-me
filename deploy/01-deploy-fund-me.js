// async function deployFunc(hre) {
//     console.log("Hi!")
// }

// module.exports.default = deployFunc

// above is same as below

const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, devChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddr
    if (devChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddr = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddr = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // const ethUsdPriceFeedAddr = networkConfig[chainId]["ethUsdPriceFeed"]
    const args = [ethUsdPriceFeedAddr]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put priceFeedAddr
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }
    log("------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
