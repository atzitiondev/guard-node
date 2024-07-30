// blockchain.js
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

    isNumberReported(number) {
        return this.chain.some(block => block.data.number === number);
    }

    createGenesisBlock() {
        const timestamp = new Date().toISOString();
        return new Block(0, "0", timestamp, "Genesis Block", this.calculateHash(0, "0", timestamp, "Genesis Block"));
    }

    calculateHash(index, previousHash, timestamp, data) {
        return crypto.createHash('sha256').update(index + previousHash + timestamp + JSON.stringify(data)).digest('hex');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.hash = this.calculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data);
        const latestBlock = this.getLatestBlock();
        if (latestBlock.index + 1 === newBlock.index && latestBlock.hash === newBlock.previousHash) {
            this.chain.push(newBlock);
        } else {
            console.error("Error: El nuevo bloque no sigue correctamente la cadena de bloques.");
        }
    }

    addNode(nodeUrl) {
        this.nodes.add(nodeUrl);
    }

    getNodes() {
        return Array.from(this.nodes);
    }

    replaceChain(newChain) {
        this.chain = newChain;
        console.log("Chain has been replaced with the new chain");
    }

    isValidChain(chain) {
        return true;
    }
}

module.exports = { Block, Blockchain };