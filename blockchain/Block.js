const { SHA3 } = require("sha3");
const ChainUtil = require("../ChainUtil");

class Block {
  constructor(timestamp, lastHash, hash, data, validator, signature) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.validator = validator;
    this.signature = signature;
  }

  toString = () => {
    return `Block - 
      Timestamp : ${this.timestamp}
      Last Hash : ${this.lastHash}
      Hash      : ${this.hash}
      Data      : ${this.data}
      Validator : ${this.validator}
      Signature : ${this.signature}`;
  };

  static genesis = () => {
    return new this("genesis-time", "genesis", "genesis-hash", []);
  };

  static hash = (timestamp, lastHash, data) => {
    const sha512 = new SHA3(512);
    sha512.update(
      JSON.stringify(`${timestamp}${lastHash}${JSON.stringify(data)}`)
    );
    return sha512.digest("hex");
  };

  static createBlock(lastBlock, data, wallet) {
    let hash;
    let timestamp = Date.now();
    const lastHash = lastBlock.hash;
    // let data = [];
    // data.push(_data);
    hash = Block.hash(timestamp, lastHash, data);

    let validator = wallet.getPublicKey();

    let signature = Block.signBlockHash(hash, wallet);

    return new this(timestamp, lastHash, hash, data, validator, signature);
  }

  static blockHash = (block) => {
    const { timestamp, lastHash, data } = block;
    return Block.hash(timestamp, lastHash, data);
  };

  static signBlockHash(hash, wallet) {
    return wallet.sign(hash);
  }

  static verifyBlock(block) {
    return ChainUtil.verifySignature(
      block.validator,
      block.signature,
      Block.hash(block.timestamp, block.lastHash, block.data)
    );
  }

  static verifyLeader(block, leader) {
    return block.validator == leader ? true : false;
  }
}

module.exports = Block;
