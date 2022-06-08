const { getNamedAccounts, ethers, network } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

// let var = false
// let someVar = var ? "yes" : "no"

devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const sendVal = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendVal })
              await fundMe.withdraw()
              const endingBal = await fundMe.provider.getBalance(fundMe.address)
              assert.equal(endingBalance.toString(), "0")
          })
      })
