const crypto = require('crypto');

class Block {
    constructor(index, previousHash, timestamp, data, hash) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.nodes = new Set();
    }

    createGenesisBlock() {
        return new Block(0, "0", new Date().toISOString(), "Genesis Block", this.calculateHash(0, "0", new Date().toISOString(), "Genesis Block"));
    }

    calculateHash(index, previousHash, timestamp, data) {
        return crypto.createHash('sha256').update(index + previousHash + timestamp + JSON.stringify(data)).digest('hex');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.hash = this.calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data);
        this.chain.push(newBlock);
    }

    addNode(nodeUrl) {
        this.nodes.add(nodeUrl);
    }

    getNodes() {
        return Array.from(this.nodes);
    }
}

module.exports = { Block, Blockchain };