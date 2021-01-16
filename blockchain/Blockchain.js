const Block = require("./Block");
const Stake = require("./Stake");
const Account = require("./Account");
const Validators = require("./Validators");
const Wallet = require("../wallet/Wallet");
const secret = "I am the first leader";

const TRANSACTION_TYPE = {
  transaction: "TRANSACTION",
  stake: "STAKE",
  validatorFee: "VALIDATOR_FEE",
};

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
    this.stakes = new Stake();
    this.accounts = new Account();
    this.validators = new Validators();
  }

  addBlock = (data) => {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      data,
      new Wallet(secret)
    );
    this.chain.push(block);
    console.log("NEW BLOCK ADDED");
    return block;
  };

  createBlock(transactions, wallet) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      transactions,
      wallet
    );
    return block;
  }

  isValidChain = (chain) => {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];
      if (
        block.lastHash !== lastBlock.hash ||
        block.hash !== Block.blockHash(block)
      )
        return false;

      return true;
    }
  };

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.log("Recieved chain is not longer than the current chain.");
      return;
    } else if (!this.isValidChain(newChain)) {
      console.log("Recieved Chain is invalid");
      return;
    }

    console.log("Replacing the current chain with the new chain");
    this.resetState();
    this.executeChain(newChain);
    this.chain = newChain;
  }

  getBalance(publicKey) {
    return this.accounts.getBalance(publicKey);
  }

  getLeader() {
    return this.stakes.getMax(this.validators.list);
  }

  initialize(address) {
    this.accounts.initialize(address);
    this.stakes.initialize(address);
  }

  isValidBlock(block) {
    const lastBlock = this.chain[this.chain.length - 1];
    if (
      block.lastHash === lastBlock.hash &&
      block.hash === Block.blockHash(block) &&
      Block.verifyBlock(block) &&
      Block.verifyLeader(block, this.getLeader())
    ) {
      console.log("block valid");
      this.addBlock(block);
      this.executeTransactions(block);
      return true;
    }
    return false;
  }

  executeTransactions(block) {
    block.data.forEach((transaction) => {
      console.log(`transaction:`);
      console.log(`type    : ${transaction.type}`);
      console.log(`amount  : ${transaction.output.amount}`);
      switch (transaction.type) {
        case TRANSACTION_TYPE.transaction:
          this.accounts.update(transaction);
          this.accounts.transferFee(block, transaction);
          break;
        case TRANSACTION_TYPE.stake:
          this.stakes.update(transaction);
          this.accounts.decrement(
            transaction.input.from,
            transaction.output.amount
          );
          this.accounts.transferFee(block, transaction);
          break;
        case TRANSACTION_TYPE.validatorFee:
          if (this.validators.update(transaction)) {
            this.accounts.decrement(
              transaction.input.from,
              transaction.output.amount
            );
            this.accounts.transferFee(block, transaction);
          }
          break;
      }
    });
  }

  executeChain(chain) {
    chain.forEach((block) => {
      this.executeTransactions(block);
    });
  }

  resetState() {
    this.chain = [Block.genesis()];
    this.stakes = new Stake();
    this.accounts = new Account();
    this.validators = new Validators();
  }
}

module.exports = Blockchain;
