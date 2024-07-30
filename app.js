// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Block, Blockchain } = require('./blockchain');
const axios = require('axios');

const app = express();
const port = 3333;

app.use(bodyParser.json());

const blockchain = new Blockchain();

app.get('/', (req, res) => {
  res.send('Guard Node corriendo');
});

app.post('/block', (req, res) => {
    const { number, reason } = req.body;
    const latestBlock = blockchain.getLatestBlock();
    const newBlock = new Block(
        latestBlock.index + 1,
        latestBlock.hash,
        new Date().toISOString(),
        { number, reason }
    );
    blockchain.addBlock(newBlock);
    res.status(201).send('Number blocked');
});

app.get('/blocked', (req, res) => {
    const blocks = blockchain.chain.map(block => block.data);
    res.json(blocks);
});

app.post('/addNode', async (req, res) => {
    const { nodeUrl } = req.body;
    blockchain.addNode(nodeUrl);
    await syncWithNode(nodeUrl);
    res.status(201).send('Node added');
});

app.get('/nodes', (req, res) => {
    res.json(blockchain.getNodes());
});

const syncWithNode = async (nodeUrl) => {
    try {
        const response = await axios.get(`${nodeUrl}/blocked`);
        const remoteBlocks = response.data;

        if (remoteBlocks.length > 0) {
            // Reconstruct the remote blockchain
            const remoteChain = remoteBlocks.map((data, index) => {
                if (index === 0) return blockchain.createGenesisBlock(); // Use the genesis block
                return new Block(index, blockchain.chain[index - 1].hash, new Date().toISOString(), data, "");
            });

            // Check if the remote chain is longer and valid
            if (remoteChain.length > blockchain.chain.length && blockchain.isValidChain(remoteChain)) {
                blockchain.replaceChain(remoteChain);
            }
        }
    } catch (e) {
        console.error("Error al conectar con el nodo:", e.message);
    }
};

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});