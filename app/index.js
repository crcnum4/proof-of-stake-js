const HTTP_PORT = process.argv[2] || 3000;
const Blockchain = require("../blockchain/Blockchain");
const P2pServer = require("./p2pServer");
const Wallet = require("../wallet/Wallet");
const TransactionPool = require("../wallet/TransactionPool");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const devcoin = new Blockchain();
const wallet = new Wallet(`${Date.now()}`);

const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(devcoin, transactionPool, wallet);

app.get("/blocks", (req, res) => {
  res.json(devcoin.chain);
});

// app.post("/mine", (req, res) => {
//   const block = devcoin.addBlock(req.body.data);
//   console.log(`new block added: ${block.toString()}`);

//   res.redirect("/blocks");
//   p2pServer.syncChain();
// });

app.get("/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

app.post("/transact", (req, res) => {
  const { to, amount, type } = req.body;

  const transaction = wallet.createTransaction(
    to,
    amount,
    type,
    devcoin,
    transactionPool
  );
  if (transaction.error) {
    res.json(transaction);
  }
  p2pServer.broadcastTransaction(transaction);
  res.json(transaction);
});

app.get("/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get("/balance", (req, res) => {
  res.json({ balance: devcoin.getBalance(wallet.publicKey) });
});

app.listen(HTTP_PORT, () => console.log(`listening on port ${HTTP_PORT}`));
p2pServer.listen();
