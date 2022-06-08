const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendVal = ethers.utils.parseEther("1") // 1 ETH
          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("updated the amt funded data structure", async function () {
                  await fundMe.fund({ value: sendVal })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendVal.toString())
              })
              it("adds funder to array of getFunder", async function () {
                  await fundMe.fund({ value: sendVal })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendVal })
              })

              it("withdraw ETH from a single funder", async function () {
                  // Arrange
                  const startingFundMeBal = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBal = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Act
                  const txReponse = await fundMe.withdraw()
                  const txReceipt = await txReponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBal = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBal = await fundMe.provider.getBalance(
                      deployer
                  )
                  // Assert
                  assert.equal(endingFundMeBal, 0)
                  assert.equal(
                      // .add() bc working with big numbers
                      startingFundMeBal.add(startingDeployerBal).toString(),
                      endingDeployerBal.add(gasCost).toString()
                  )
              })
              it("cheaperWithdraw testing...", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendVal })
                  }
                  const startingFundMeBal = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBal = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Act
                  const txReponse = await fundMe.withdraw()
                  const txReceipt = await txReponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBal = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBal = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Assert
                  assert.equal(endingFundMeBal, 0)
                  assert.equal(
                      // .add() bc working with big numbers
                      startingFundMeBal.add(startingDeployerBal).toString(),
                      endingDeployerBal.add(gasCost).toString()
                  )

                  // Make sure that the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("allows us to withdraw with multiple getFunder", async function () {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendVal })
                  }
                  const startingFundMeBal = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBal = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Act
                  const txReponse = await fundMe.cheaperWithdraw()
                  const txReceipt = await txReponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBal = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBal = await fundMe.provider.getBalance(
                      deployer
                  )

                  // Assert
                  assert.equal(endingFundMeBal, 0)
                  assert.equal(
                      // .add() bc working with big numbers
                      startingFundMeBal.add(startingDeployerBal).toString(),
                      endingDeployerBal.add(gasCost).toString()
                  )

                  // Make sure that the getFunder are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
