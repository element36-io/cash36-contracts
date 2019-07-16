/**
 * Test copied from OpenZeppelin Framework - Basic Tests ERC20 of Token36 as ERC20.
 * Basically making sure our Token still behaves as an ERC20 Basic Token.
 */
const chai = require('chai')
chai.should()

const {BN, constants, expectEvent, expectRevert} = require('openzeppelin-test-helpers')
const {ZERO_ADDRESS} = constants

const {
  shouldBehaveLikeERC20,
  shouldBehaveLikeERC20Transfer,
  shouldBehaveLikeERC20Approve,
} = require('openzeppelin-test-helpers')


const Cash36 = artifacts.require('./Cash36.sol')
const Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
const Cash36Exchanges = artifacts.require('./Cash36Exchanges.sol')
const Token36 = artifacts.require('./Token36.sol')
const Token36Controller = artifacts.require('./CHF36Controller.sol')
const ERC20 = artifacts.require('./mocks/ERC20Mock.sol')

contract('ERC20 Basics', function (accounts) {
  const initialHolder = accounts[0]
  const recipient = accounts[1]

  before(async function () {
    const Cash36Instance = await Cash36.deployed()
    const Cash36ComplianceInstance = await Cash36Compliance.deployed()
    const Cash36ExchangeInstance = await Cash36Exchanges.deployed()

    const tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    await Cash36ExchangeInstance.addExchange(accounts[3], tokenAddress)

    this.token = await ERC20.at(tokenAddress)

    await Cash36ComplianceInstance.addUser(accounts[0], { from: accounts[ 0 ] })
    await Cash36ComplianceInstance.addUser(accounts[1], { from: accounts[ 0 ] })
    await Cash36ComplianceInstance.addUser(accounts[2], { from: accounts[ 0 ] })
  })

  describe('detailed token', function () {
    it('has a name', async function () {
      (await this.token.name()).should.be.equal('Swiss Franc')
    })

    it('has a symbol', async function () {
      (await this.token.symbol()).should.be.equal('CHF36')
    })

    it('has an amount of decimals', async function () {
      (await this.token.decimals()).should.be.bignumber.equal('18')
    })
  })

  describe('total supply', function () {
    it('returns the total amount of tokens', async function () {
      (await this.token.totalSupply()).should.be.bignumber.equal('0')
    })
  })

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal('0')
      })
    })

    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        (await this.token.balanceOf(recipient)).should.be.bignumber.equal('0')
      })
    })
  })
})

contract('ERC20 Transfer', function (accounts) {
  const initialHolder = accounts[0]
  const initialSupply = new BN(5)
  const recipient = accounts[1]
  const amount = 1
  const amountTooHigh = 2

  before(async function () {
    const Cash36Instance = await Cash36.deployed()
    const Cash36ComplianceInstance = await Cash36Compliance.deployed()
    const Cash36ExchangeInstance = await Cash36Exchanges.deployed()

    const tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    await Cash36ExchangeInstance.addExchange(accounts[3], tokenAddress)

    //this.token = await Token36.new(initialHolder, initialSupply);
    this.token = await ERC20.at(tokenAddress)

    await Cash36ComplianceInstance.addUser(accounts[0])
    await Cash36ComplianceInstance.addUser(accounts[1])
    await Cash36ComplianceInstance.addUser(accounts[2])

    // Minting via implemented token36
    let token36 = await Token36.at(tokenAddress)
    let controllerAddress = await token36.controller()
    let controller = await Token36Controller.at(controllerAddress)
    await controller.mint(initialHolder, initialHolder, initialSupply, { from: accounts[3] })
  })

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient

      describe('when the sender does not have enough balance', function () {
        it('reverts', async function () {
          await expectRevert.unspecified(this.token.transfer(to, 5*amountTooHigh, {from: initialHolder}))
        })
      })

      describe('when the sender has enough balance', function () {
        it('transfers the requested amount', async function () {
          await this.token.transfer(to, amount, {from: initialHolder});

          (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal('4');

          (await this.token.balanceOf(to)).should.be.bignumber.equal('1')
        })

        it('emits a transfer event', async function () {
          const {logs} = await this.token.transfer(to, amount, {from: initialHolder})

          expectEvent.inLogs(logs, 'Transfer', {
            from: initialHolder,
            to: to,
            value: '1',
          })
        })
      })
    })

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS

      it('reverts', async function () {
        await expectRevert.unspecified(this.token.transfer(to, amount, {from: initialHolder}))
      })
    })
  })
})

contract('ERC20 Transfer From', function (accounts) {
  const initialHolder = accounts[0]
  const initialSupply = new BN(5);
  const recipient = accounts[1]
  const anotherAccount = accounts[2]
  const amount = 1
  const amountTooHigh = 10

  before(async function () {
    const Cash36Instance = await Cash36.deployed()
    const Cash36ComplianceInstance = await Cash36Compliance.deployed()
    const Cash36ExchangeInstance = await Cash36Exchanges.deployed()

    const tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    await Cash36ExchangeInstance.addExchange(accounts[3], tokenAddress)

    //this.token = await Token36.new(initialHolder, initialSupply);
    this.token = await ERC20.at(tokenAddress)

    await Cash36ComplianceInstance.addUser(accounts[0])
    await Cash36ComplianceInstance.addUser(accounts[1])
    await Cash36ComplianceInstance.addUser(accounts[2])

    // Minting via implemented token36
    let token36 = await Token36.at(tokenAddress)
    let controllerAddress = await token36.controller()
    let controller = await Token36Controller.at(controllerAddress)
    await controller.mint(initialHolder, initialHolder, initialSupply, {from: accounts[3]})
  })

  describe('transfer from', function () {
    const spender = recipient

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount

      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, amount, {from: initialHolder})
        })

        describe('when the initial holder has enough balance', function () {
          it('transfers the requested amount', async function () {
            await this.token.transferFrom(initialHolder, to, amount, {from: spender});

            (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal('4');

            (await this.token.balanceOf(to)).should.be.bignumber.equal('1')
          })

          it('decreases the spender allowance', async function () {
            await this.token.transferFrom(initialHolder, to, amount, {from: spender});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('0')
          })

          it('emits a transfer event', async function () {
            const {logs} = await this.token.transferFrom(initialHolder, to, amount, {from: spender})

            expectEvent.inLogs(logs, 'Transfer', {
              from: initialHolder,
              to: to,
              value: '1',
            })
          })

          it('emits an approval event', async function () {
            const {logs} = await this.token.transferFrom(initialHolder, to, amount, {from: spender})

            expectEvent.inLogs(logs, 'Approval', {
              owner: initialHolder,
              spender: spender,
              value: await this.token.allowance(initialHolder, spender),
            })
          })
        })

        describe('when the initial holder does not have enough balance', function () {
          const amount = 5 * amountTooHigh

          it('reverts', async function () {
            await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, amount, {from: spender}))
          })
        })
      })

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 5 * amount, {from: initialHolder})
        })

        describe('when the initial holder has enough balance', function () {
          it('reverts', async function () {
            await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, 5 * amountTooHigh, {from: spender}))
          })
        })

        describe('when the initial holder does not have enough balance', function () {
          const amount = amountTooHigh

          it('reverts', async function () {
            await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, 5 * amount, {from: spender}))
          })
        })
      })
    })

    describe('when the recipient is the zero address', function () {
      const amount = '1'
      const to = ZERO_ADDRESS

      beforeEach(async function () {
        await this.token.approve(spender, amount, {from: initialHolder})
      })

      it('reverts', async function () {
        await expectRevert.unspecified(this.token.transferFrom(initialHolder, to, amount, {from: spender}))
      })
    })
  })

  describe('decrease allowance', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient

      before(async function () {
        await this.token.approve(spender, 0, {from: initialHolder})
      })

      function shouldDecreaseApproval (amount) {
        describe('when there was no approved amount before', function () {
          it('reverts', async function () {
            await expectRevert.unspecified(this.token.decreaseAllowance(spender, amount, {from: initialHolder}))
          })
        })

        describe('when the spender had an approved amount', function () {
          const approvedAmount = new BN(amount)

          beforeEach(async function () {
            ({logs: this.logs} = await this.token.approve(spender, approvedAmount, {from: initialHolder}))
          })

          it('emits an approval event', async function () {
            const {logs} = await this.token.decreaseAllowance(spender, approvedAmount, {from: initialHolder})

            expectEvent.inLogs(logs, 'Approval', {
              owner: initialHolder,
              spender: spender,
              value: new BN(0),
            })
          })

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('1')
          })

          it('sets the allowance to zero when all allowance is removed', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount, {from: initialHolder});
            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal('0')
          })

          it('reverts when more than the full allowance is removed', async function () {
            await expectRevert.unspecified(
              this.token.decreaseAllowance(spender, approvedAmount.addn(1), {from: initialHolder})
            )
          })
        })
      }

      describe('when the sender has enough balance', function () {
        shouldDecreaseApproval(amount)
      })

      describe('when the sender does not have enough balance', function () {
        shouldDecreaseApproval(amountTooHigh)
      })
    })

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS

      it('reverts', async function () {
        await expectRevert.unspecified(this.token.decreaseAllowance(spender, amount, {from: initialHolder}))
      })
    })
  })

  describe('increase allowance', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient
      let approvedAmount = new BN(1)

      before(async function () {
        await this.token.approve(spender, 0, {from: initialHolder})
      })

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const {logs} = await this.token.increaseAllowance(spender, approvedAmount, {from: initialHolder})

          expectEvent.inLogs(logs, 'Approval', {
            owner: initialHolder,
            spender: spender,
            value: approvedAmount,
          })
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, new BN(1), {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(approvedAmount.addn(1))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), {from: initialHolder})
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, new BN(1), {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(approvedAmount.addn(1))
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        it('emits an approval event', async function () {
          const {logs} = await this.token.increaseAllowance(spender, new BN(amountTooHigh), {from: initialHolder})

          expectEvent.inLogs(logs, 'Approval', {
            owner: initialHolder,
            spender: spender,
            value: new BN(amountTooHigh).addn(2),
          })
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, approvedAmount, {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(approvedAmount.addn(12))
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), {from: initialHolder})
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, approvedAmount, {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(approvedAmount.addn(1))
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS

      it('reverts', async function () {
        await expectRevert.unspecified(this.token.increaseAllowance(spender, amount, {from: initialHolder}))
      })
    })
  })
})

contract('ERC20 Burn', function (accounts) {
  const initialHolder = accounts[0]
  const initialSupply = new BN(5);
  const recipient = accounts[1]
  const anotherAccount = accounts[2]
  const amount = 1
  const amountTooHigh = 10

  before(async function () {
    const Cash36Instance = await Cash36.deployed()
    const Cash36ComplianceInstance = await Cash36Compliance.deployed()
    const Cash36ExchangeInstance = await Cash36Exchanges.deployed()

    const tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    await Cash36ExchangeInstance.addExchange(accounts[3], tokenAddress)

    //this.token = await Token36.new(initialHolder, initialSupply);
    this.token = await ERC20.at(tokenAddress)

    await Cash36ComplianceInstance.addUser(accounts[0])
    await Cash36ComplianceInstance.addUser(accounts[1])
    await Cash36ComplianceInstance.addUser(accounts[2])

    // Minting via implemented token36
    let token36 = await Token36.at(tokenAddress)
    let controllerAddress = await token36.controller()
    let controller = await Token36Controller.at(controllerAddress)
    await controller.mint(initialHolder, initialHolder, initialSupply, {from: accounts[3]})
  })

  describe('_burn', function () {
    describe('for a non null account', function () {
      it('rejects burning more than balance', async function () {
        await expectRevert.unspecified(this.token.burn(initialSupply.addn(1), {from: initialHolder}));
      });

      const describeBurn = function (description, amount, delta) {
        describe(description, function () {
          before('burning', async function () {
            const {logs} = await this.token.burn(amount, {from: initialHolder});
            this.logs = logs;
          });

          it('decrements totalSupply', async function () {
            const expectedSupply = initialSupply.sub(amount);
            (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
          });

          it('decrements initialHolder balance', async function () {
            const expectedBalance = initialSupply.sub(amount);
            (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal(expectedBalance);
          });

          it('emits Transfer event', async function () {
            const event = expectEvent.inLogs(this.logs, 'Transfer', {
              from: initialHolder,
              to: ZERO_ADDRESS,
            });

            event.args.value.should.be.bignumber.equal(amount)
          });
        });
      };

      describeBurn('for entire balance', initialSupply, 4);
      //describeBurn('for less amount than balance', initialSupply.subn(1), 5);
    });
  });
})

contract('ERC20 Burn From', function (accounts) {
  const initialHolder = accounts[0]
  const initialSupply = new BN(5);
  const recipient = accounts[1]
  const anotherAccount = accounts[2]
  const amount = 1
  const amountTooHigh = 10

  before(async function () {
    const Cash36Instance = await Cash36.deployed()
    const Cash36ComplianceInstance = await Cash36Compliance.deployed()
    const Cash36ExchangeInstance = await Cash36Exchanges.deployed()

    const tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    await Cash36ExchangeInstance.addExchange(accounts[3], tokenAddress)

    //this.token = await Token36.new(initialHolder, initialSupply);
    this.token = await ERC20.at(tokenAddress)

    await Cash36ComplianceInstance.addUser(accounts[0])
    await Cash36ComplianceInstance.addUser(accounts[1])
    await Cash36ComplianceInstance.addUser(accounts[2])

    // Minting via implemented token36
    let token36 = await Token36.at(tokenAddress)
    let controllerAddress = await token36.controller()
    let controller = await Token36Controller.at(controllerAddress)
    await controller.mint(initialHolder, initialHolder, initialSupply, {from: accounts[3]})
  })

  describe('_burnFrom', function () {
    const allowance = new BN(5);

    const spender = anotherAccount;

    before('approving', async function () {
      await this.token.approve(spender, allowance, {from: initialHolder});
    });

    describe('for a non null account', function () {
      it('rejects burning more than allowance', async function () {
        await expectRevert.unspecified(this.token.burnFrom(initialHolder, allowance.addn(1), {from: spender}));
      });

      it('rejects burning more than balance', async function () {
        await expectRevert.unspecified(this.token.burnFrom(initialHolder, initialSupply.addn(1), {from: spender}));
      });

      const describeBurnFrom = function (description, amount) {
        describe(description, function () {
          before('burning', async function () {
            const {logs} = await this.token.burnFrom(initialHolder, amount, {from: spender});
            this.logs = logs;
          });

          it('decrements totalSupply', async function () {
            const expectedSupply = initialSupply.sub(amount);
            (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
          });

          it('decrements initialHolder balance', async function () {
            const expectedBalance = initialSupply.sub(amount);
            (await this.token.balanceOf(initialHolder)).should.be.bignumber.equal(expectedBalance);
          });

          it('decrements spender allowance', async function () {
            const expectedAllowance = allowance.sub(amount);
            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(expectedAllowance);
          });

          it('emits a Transfer event', async function () {
            const event = expectEvent.inLogs(this.logs, 'Transfer', {
              from: initialHolder,
              to: ZERO_ADDRESS,
            });

            event.args.value.should.be.bignumber.equal(amount);
          });

          it('emits an Approval event', async function () {
            expectEvent.inLogs(this.logs, 'Approval', {
              owner: initialHolder,
              spender: spender,
              value: await this.token.allowance(initialHolder, spender),
            });
          });
        });
      };

      describeBurnFrom('for entire allowance', allowance);
      //describeBurnFrom('for less amount than allowance', allowance.subn(1));
    });
  });
})
