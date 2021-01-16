const Transaction = require("./Transaction");
const { TRANSACTION_THRESHOLD } = require("../config");

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  addTransaction(transaction) {
    this.transactions.push(transaction);
    return this.transactions.length >= TRANSACTION_THRESHOLD;
  }

  validTransactions() {
    return this.transactions.filter((transaction) => {
      if (!Transaction.verifyTransaction(transaction)) {
        console.log(`Invalid signature from ${transaction.data.from}`);
        return;
      }
      return transaction;
    });
  }

  transactionExists(transaction) {
    return this.transactions.some((t) => t.id === transaction.id);
  }

  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
