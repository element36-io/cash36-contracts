/**
 * Test copied from OpenZeppelin Framework - Basic ERC20 Tests
 * Making sure our Token still behaves as an ERC20 Basic Token
 */
const chai = require('chai')
chai.should()

const {BN, constants, expectEvent, shouldFail} = require('openzeppelin-test-helpers')
const {ZERO_ADDRESS} = constants

const Cash36 = artifacts.require('./Cash36.sol')
const Cash36Compliance = artifacts.require('./Cash36Compliance.sol')
const Cash36Exchanges = artifacts.require('./Cash36Exchanges.sol')
const Token36Controller = artifacts.require('./CHF36Controller.sol')
const ERC20 = artifacts.require('./CHF36.sol')

contract('ERC20 Basics', function (accounts) {
  const initialHolder = accounts[0]
  const recipient = accounts[1]
  const anotherAccount = accounts[2]
  const amount = 1
  const amountTooHigh = 2

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
  const recipient = accounts[1]
  const amount = 1
  const amountTooHigh = 2

  before(async function () {
    const Cash36Instance = await Cash36.deployed()
    const Cash36ComplianceInstance = await Cash36Compliance.deployed()
    const Cash36ExchangeInstance = await Cash36Exchanges.deployed()

    const tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    await Cash36ExchangeInstance.addExchange(accounts[3], tokenAddress)

    this.token = await ERC20.at(tokenAddress)

    await Cash36ComplianceInstance.addUser(accounts[0])
    await Cash36ComplianceInstance.addUser(accounts[1])
    await Cash36ComplianceInstance.addUser(accounts[2])

    const tokenControllerAddress = await this.token.controller()
    const ControllerInstance = await Token36Controller.at(tokenControllerAddress)

    await ControllerInstance.mint(initialHolder, 5*amount, {from: accounts[3]})
  })

  describe('transfer', function () {
    describe('when the recipient is not the zero address', function () {
      const to = recipient

      describe('when the sender does not have enough balance', function () {
        it('reverts', async function () {
          await shouldFail.reverting(this.token.transfer(to, 5*amountTooHigh, {from: initialHolder}))
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
        await shouldFail.reverting(this.token.transfer(to, amount, {from: initialHolder}))
      })
    })
  })
})

contract('ERC20 Transfer From', function (accounts) {
  const initialHolder = accounts[0]
  const recipient = accounts[1]
  const anotherAccount = accounts[2]
  const amount = 1
  const amountTooHigh = 2

  before(async function () {
    const Cash36Instance = await Cash36.deployed()
    const Cash36ComplianceInstance = await Cash36Compliance.deployed()
    const Cash36ExchangeInstance = await Cash36Exchanges.deployed()

    const tokenAddress = await Cash36Instance.getTokenBySymbol('CHF36')
    await Cash36ExchangeInstance.addExchange(accounts[3], tokenAddress)

    this.token = await ERC20.at(tokenAddress)

    await Cash36ComplianceInstance.addUser(accounts[0])
    await Cash36ComplianceInstance.addUser(accounts[1])
    await Cash36ComplianceInstance.addUser(accounts[2])

    const tokenControllerAddress = await this.token.controller()
    const ControllerInstance = await Token36Controller.at(tokenControllerAddress)

    await ControllerInstance.mint(initialHolder, 5*amount, {from: accounts[3]})
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
          const amount = 5*amountTooHigh

          it('reverts', async function () {
            await shouldFail.reverting(this.token.transferFrom(initialHolder, to, amount, {from: spender}))
          })
        })
      })

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, 5*amount, {from: initialHolder})
        })

        describe('when the initial holder has enough balance', function () {
          it('reverts', async function () {
            await shouldFail.reverting(this.token.transferFrom(initialHolder, to, 5*amountTooHigh, {from: spender}))
          })
        })

        describe('when the initial holder does not have enough balance', function () {
          const amount = amountTooHigh

          it('reverts', async function () {
            await shouldFail.reverting(this.token.transferFrom(initialHolder, to, 5*amount, {from: spender}))
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
        await shouldFail.reverting(this.token.transferFrom(initialHolder, to, amount, {from: spender}))
      })
    })
  })

  /*
  describe('decrease allowance', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient

      function shouldDecreaseApproval (amount) {
        describe('when there was no approved amount before', function () {
          it('reverts', async function () {
            await shouldFail.reverting(this.token.decreaseAllowance(spender, amount, {from: initialHolder}))
          })
        })

        describe('when the spender had an approved amount', function () {
          const approvedAmount = amount

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
            await shouldFail.reverting(
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
        await shouldFail.reverting(this.token.decreaseAllowance(spender, amount, {from: initialHolder}))
      })
    })
  })

  describe('increase allowance', function () {
    describe('when the spender is not the zero address', function () {
      const spender = recipient

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const {logs} = await this.token.increaseAllowance(spender, amount, {from: initialHolder})

          expectEvent.inLogs(logs, 'Approval', {
            owner: initialHolder,
            spender: spender,
            value: amount,
          })
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), {from: initialHolder})
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount.addn(1))
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        it('emits an approval event', async function () {
          const {logs} = await this.token.increaseAllowance(spender, amountTooHigh, {from: initialHolder})

          expectEvent.inLogs(logs, 'Approval', {
            owner: initialHolder,
            spender: spender,
            value: amount,
          })
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), {from: initialHolder})
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, {from: initialHolder});

            (await this.token.allowance(initialHolder, spender)).should.be.bignumber.equal(amount.addn(1))
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS

      it('reverts', async function () {
        await shouldFail.reverting(this.token.increaseAllowance(spender, amount, {from: initialHolder}))
      })
    })
  })
  * /

  /*describe('_mint', function () {
    const amount = new BN(50);

    it('rejects a null account', async function () {
      await shouldFail.reverting(this.token.mint(ZERO_ADDRESS, amount));
    });

    describe('for a non null account', function () {
      beforeEach('minting', async function () {
        const { logs } = await this.token.mint(recipient, amount);
        this.logs = logs;
      });

      it('increments totalSupply', async function () {
        const expectedSupply = initialSupply.add(amount);
        (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
      });

      it('increments recipient balance', async function () {
        (await this.token.balanceOf(recipient)).should.be.bignumber.equal(amount);
      });

      it('emits Transfer event', async function () {
        const event = expectEvent.inLogs(this.logs, 'Transfer', {
          from: ZERO_ADDRESS,
          to: recipient,
        });

        event.args.value.should.be.bignumber.equal(amount);
      });
    });
  });

  xdescribe('_burn', function () {
    it('rejects a null account', async function () {
      await shouldFail.reverting(this.token.burn(ZERO_ADDRESS, new BN(1)));
    });

    describe('for a non null account', function () {
      it('rejects burning more than balance', async function () {
        await shouldFail.reverting(this.token.burn(initialHolder, initialSupply.addn(1)));
      });

      const describeBurn = function (description, amount) {
        describe(description, function () {
          beforeEach('burning', async function () {
            const { logs } = await this.token.burn(initialHolder, amount);
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

            event.args.value.should.be.bignumber.equal(amount);
          });
        });
      };

      describeBurn('for entire balance', initialSupply);
      describeBurn('for less amount than balance', initialSupply.subn(1));
    });
  });

  xdescribe('_burnFrom', function () {
    const allowance = new BN(70);

    const spender = anotherAccount;

    beforeEach('approving', async function () {
      await this.token.approve(spender, allowance, { from: initialHolder });
    });

    it('rejects a null account', async function () {
      await shouldFail.reverting(this.token.burnFrom(ZERO_ADDRESS, new BN(1)));
    });

    describe('for a non null account', function () {
      it('rejects burning more than allowance', async function () {
        await shouldFail.reverting(this.token.burnFrom(initialHolder, allowance.addn(1)));
      });

      it('rejects burning more than balance', async function () {
        await shouldFail.reverting(this.token.burnFrom(initialHolder, initialSupply.addn(1)));
      });

      const describeBurnFrom = function (description, amount) {
        describe(description, function () {
          beforeEach('burning', async function () {
            const { logs } = await this.token.burnFrom(initialHolder, amount, { from: spender });
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
      describeBurnFrom('for less amount than allowance', allowance.subn(1));
    });
  });*/

  /*describe('approve', function () {
    testApprove(initialHolder, recipient, initialSupply, function (owner, spender, amount) {
      return this.token.approve(spender, amount, { from: owner });
    });
  });

  describe('_approve', function () {
    testApprove(initialHolder, recipient, initialSupply, function (owner, spender, amount) {
      return this.token.approveInternal(owner, spender, amount);
    });

    describe('when the owner is the zero address', function () {
      it('reverts', async function () {
        await shouldFail.reverting(this.token.approveInternal(ZERO_ADDRESS, recipient, initialSupply));
      });
    });
  });*/

  /*function testApprove (owner, spender, supply, approve) {
    describe('when the spender is not the zero address', function () {
      describe('when the sender has enough balance', function () {
        const amount = supply;

        it('emits an approval event', async function () {
          const { logs } = await approve.call(this, owner, spender, amount);

          expectEvent.inLogs(logs, 'Approval', {
            owner: owner,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await approve.call(this, owner, spender, amount);

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await approve.call(this, owner, spender, new BN(1));
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await approve.call(this, owner, spender, amount);

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = amountTooHigh;

        it('emits an approval event', async function () {
          const { logs } = await approve.call(this, owner, spender, amount);

          expectEvent.inLogs(logs, 'Approval', {
            owner: owner,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await approve.call(this, owner, spender, amount);

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await approve.call(this, owner, spender, new BN(1));
          });

          it('approves the requested amount and replaces the previous one', async function () {
            await approve.call(this, owner, spender, amount);

            (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
          });
        });
      });
    });

    describe('when the spender is the zero address', function () {
      it('reverts', async function () {
        await shouldFail.reverting(approve.call(this, owner, ZERO_ADDRESS, supply));
      });
    });
  }*/
})