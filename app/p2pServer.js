const WebSocket = require("ws");

const P2P_PORT = process.argv[3] || 5000;
const PEER_URL = process.argv[4] || null;

const MESSAGE_TYPE = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  block: "BLOCK",
};

class P2pServer {
  constructor(blockchain, transactionPool, wallet) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.transactionPool = transactionPool;
    this.wallet = wallet;
  }

  listen = () => {
    const server = new WebSocket.Server({ port: P2P_PORT });

    server.on("connection", (socket, req) => {
      this.connectSocket(socket);
    });
    if (PEER_URL) {
      this.connectToPeer();
    }

    console.log(`Listening for P2P connections on port: ${P2P_PORT}`);
  };

  connectSocket = (socket) => {
    this.sockets.push(socket);
    console.log("socket connected");
    this.messageHandler(socket);
    //blockchain send
    this.sendChain(socket);
  };

  connectToPeer = () => {
    const peers = PEER_URL.split(",");
    peers.forEach((peer) => {
      const socket = new WebSocket(peer);
      console.log("connecting to peer");
      socket.on("open", () => this.connectSocket(socket));
    });
  };

  messageHandler = (socket) => {
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      switch (data.type) {
        case MESSAGE_TYPE.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPE.transaction:
          console.log(data.transaction);
          if (!this.transactionPool.transactionExists(data.transaction)) {
            let thresholdReached = this.transactionPool.addTransaction(
              data.transaction
            );
            console.log("Recieved transaction");
            // this.broadcastTransaction(data.transaction);
            if (thresholdReached) {
              if (this.blockchain.getLeader() == this.wallet.getPublicKey()) {
                console.log("creating block");
                let block = this.blockchain.createBlock(
                  this.transactionPool.transactions,
                  this.wallet
                );
                this.broadcastBlock(block);
              }
            }
          }
          break;
        case MESSAGE_TYPE.block:
          if (this.blockchain.isValidBlock(data.block)) {
            this.broadcastBlock(data.block);
            this.transactionPool.clear();
          }
      }
    });
  };

  sendChain(socket) {
    socket.send(
      JSON.stringify({ type: MESSAGE_TYPE.chain, chain: this.blockchain.chain })
    );
  }

  syncChain() {
    this.sockets.forEach((socket) => {
      this.sendChain(socket);
    });
  }

  broadcastTransaction(transaction) {
    console.log("broadcast", transaction);
    this.sockets.forEach((socket) => {
      this.sendTransaction(socket, transaction);
    });
  }

  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.transaction,
        transaction,
      })
    );
  }

  broadcastBlock(block) {
    this.sockets.forEach((socket) => {
      this.sendBlock(socket, block);
    });
  }

  sendBlock(socket, block) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.block,
        block,
      })
    );
  }
}

module.exports = P2pServer;
