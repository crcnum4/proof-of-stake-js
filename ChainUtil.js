const { v4: uuid } = require("uuid");
const { SHA3 } = require("sha3");
const EDDSA = require("elliptic").eddsa;
const eddsa = new EDDSA("ed25519");

class ChainUtil {
  static genKeyPair(secret) {
    return eddsa.keyFromSecret(secret);
  }

  static id() {
    return uuid();
  }

  static hash(data) {
    const sha512 = new SHA3(512);
    sha512.update(JSON.stringify(data));
    return sha512.digest("hex");
  }

  static verifySignature(publicKey, signature, dataHash) {
    return eddsa.keyFromPublic(publicKey).verify(dataHash, signature);
  }
}

module.exports = ChainUtil;
