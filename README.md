# Proof of Stake Example

## Details

<p>this is a simple proof of stake system to help understand the mechanics behind it. Proof of stake is used in modern crypto currency systems with many that are not yet utilizing it aiming to switch to it in the future.</p>

## Proof of stake system explaination:

<p>This proof of stake system utilizes an ICO system to first give out up to 100000 coins. you first utilize the ICO api to award coins to the dev nodes. once you've given out as many coins as you want turn off the ICO device and you will be able to utilize the dev nodes normally.</p>

## how to use:

<p>first:</P>

```
npm install
```

### ICO Stage.

<p>run the following commands in different terminals one by one in the following order:</p>

```
npm run ico
npm run de v
npm run dev1
npm run dev2
npm run dev3
```

<p>the following items will run each one on the following urls:</p>

| command | api port | WS Port |
| ------- | -------- | ------- |
| ico     | 3005     | 5005    |
| dev     | 3000     | 5000    |
| dev1    | 3001     | 5001    |
| dev2    | 3002     | 5002    |
| dev3    | 3003     | 5003    |

<p>To award coins to the dev nodes use the following api endpoint to get the address:</p>

```
localhost:{api port}/public-key
```

<p>With the address create a post request to the ICO transact end point and create the following request:</p>

```
//url:
POST localhost:3005/ico/transact
// body:
{
    "to": "{address}",
    "amount": {amount},
    "type": "TRANSACTION"
}
```

**note that 5 transactions must be posted before the block will be created and the transactions applied to balances**

<p>Other endpoints:</p>

**note all endpoints are preceded with /ico on the ico node**

| Verb | endPoint                 | Usage                                       |
| ---- | ------------------------ | ------------------------------------------- |
| GET  | /blocks                  | Get all blocks in the chain                 |
| GET  | /transactions            | get all pending transactions                |
| GET  | /public-key              | get address of the node                     |
| GET  | /balance                 | get balance of node                         |
| GET  | /ico/balance-of/:address | ico node only, get balance of given address |
| POST | /transact                | Create transaction from node Use above obj  |

### Transaction types:

<p>TRANSACTION: needs a to address and amount</p>
<p>STAKE: needs an amount will stake the coins and can change who will be selected as the block creator</p>
<p>VALIDATOR_FEE: Must be a validator first before staking. requires an amount of at least 15 coins. Coins will be "burned" as there is no way to recover the coins. once a validator you may be selected as the Block Forger if you have staked the most coins</p>

## Proof Of Stake

This system uses the basic Stake Leader system. The Validator with the most coins staked is the one who will be selected to forge the next block each time. Future versions of this plan to implement a random weighted selection. Your selection weight is `amtCoinsStaked` chance to be selected. With another version including an Aged Weighted random selection. Your selection weight is `amtCoinsStaked * timeStakedSinceLastForge` once you forge a block your age is reset this gives other validators that have been staked for a while without forging a higher chance to forge a block.
