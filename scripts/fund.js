const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding contract...")
    const txReponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    })
    await txReponse.wait(1)
    console.log("Funded! ;{P")
}

// main
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
