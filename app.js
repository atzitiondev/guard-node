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

app.get('/chain', (req, res) => {
    const blocks = blockchain.chain;
    res.json(blocks);
});

app.post('/report', (req, res) => {
    const { number, reason } = req.body;
    if (blockchain.isNumberReported(number)) {
        return res.status(400).send('Número ya bloqueado');
    }

    const latestBlock = blockchain.getLatestBlock();
    const newBlock = new Block(
        latestBlock.index + 1,
        latestBlock.hash,
        new Date().toISOString(),
        { number, reason }
    );
    blockchain.addBlock(newBlock);
    res.status(201).send('Número bloqueado');
});

app.get('/reported', (req, res) => {
    const blocks = blockchain.chain.map(block => block.data);
    res.json(blocks);
});

app.post('/addNode', async (req, res) => {
    const { nodeUrl } = req.body;
    blockchain.addNode(nodeUrl);
    await syncWithNode(nodeUrl);
    res.status(201).send('Nodo añadido');
});

app.get('/nodes', (req, res) => {
    res.json(blockchain.getNodes());
});

const syncWithNode = async (nodeUrl) => {
    try {
        const response = await axios.get(`${nodeUrl}/chain`);
        const remoteChain = response.data;

        if (remoteChain.length > blockchain.chain.length && blockchain.isValidChain(remoteChain)) {
            // Replace the chain with the remote chain
            blockchain.replaceChain(remoteChain);
        }

        const remoteBlocks = response.data.map(block => block.data);
        const localBlockedNumbers = new Set(blockchain.chain.map(block => block.data.number));

        // Add only unique blocked numbers from the remote chain
        for (const block of remoteBlocks) {
            if (!localBlockedNumbers.has(block.number)) {
                const latestBlock = blockchain.getLatestBlock();
                const newBlock = new Block(
                    latestBlock.index + 1,
                    latestBlock.hash,
                    new Date().toISOString(),
                    block
                );
                blockchain.addBlock(newBlock);
                localBlockedNumbers.add(block.number); // Update local set
            }
        }
    } catch (e) {
        console.error("Error al conectar con el nodo:", e.message);
    }
};

// Tarea de sincronización periódica
const syncInterval = 60000; // Cada 60 segundos

const startPeriodicSync = () => {
    setInterval(async () => {
        const nodes = blockchain.getNodes();
        for (const nodeUrl of nodes) {
            await syncWithNode(nodeUrl);
        }
    }, syncInterval);
};

// Iniciar la sincronización periódica al arrancar el servidor
startPeriodicSync();

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});