const cors = require("cors");
const express = require("express");
const Blockchain = require("../blockchain/Blockchain");
const P2pServer = require("../app/p2pServer");
const Wallet = require("../wallet/Wallet");
const TransactionPool = require("../wallet/TransactionPool");
const { TRANSACTION_THRESHOLD } = require("../config");

const HTTP_PORT = process.argv[2] || 3000;

const app = express();

app.use(express.json());
app.use(cors());

const devcoin = new Blockchain();
const wallet = new Wallet("I am the first leader");

const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(devcoin, transactionPool, wallet);

app.get("/ico/blocks", (req, res) => {
  res.json(devcoin.chain);
});

// app.post("/mine", (req, res) => {
//   const block = devcoin.addBlock(req.body.data);
//   console.log(`new block added: ${block.toString()}`);

//   res.redirect("/blocks");
//   p2pServer.syncChain();
// });

app.get("/ico/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

app.post("/ico/transact", (req, res) => {
  const { to, amount, type } = req.body;

  const transaction = wallet.createTransaction(
    to,
    amount,
    type,
    devcoin,
    transactionPool
  );
  // transactionPool.addTransaction(transaction);
  p2pServer.broadcastTransaction(transaction);
  if (transactionPool.transactions.length >= TRANSACTION_THRESHOLD) {
    let block = devcoin.createBlock(transactionPool.transactions, wallet);
    transactionPool.clear();
    p2pServer.broadcastBlock(block);
  }
  res.json(transaction);
});

app.get("/ico/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get("/ico/balance", (req, res) => {
  res.json({ balance: devcoin.getBalance(wallet.publicKey) });
});

app.get("/ico/balance-of/:publicKey", (req, res) => {
  res.json({ balance: devcoin.getBalance(req.params.publicKey) });
});

app.listen(HTTP_PORT, () => console.log(`listening on port ${HTTP_PORT}`));
p2pServer.listen();
