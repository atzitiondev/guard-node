const express = require('express');
const bodyParser = require('body-parser');
const { Block, Blockchain } = require('./blockchain'); // Importa la clase Block

const app = express();
const port = 3000;

app.use(bodyParser.json());

const blockchain = new Blockchain();

app.get('/', (req, res) => {
  res.send('Guard Node corriendo');
});

// Ruta para agregar un número bloqueado
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

// Ruta para consultar todos los números bloqueados
app.get('/blocked', (req, res) => {
    const blocks = blockchain.chain.map(block => block.data);
    res.json(blocks);
});

// Ruta para agregar un nodo
app.post('/addNode', (req, res) => {
    const { nodeUrl } = req.body;
    blockchain.addNode(nodeUrl);
    res.status(201).send('Node added');
});

// Ruta para consultar nodos
app.get('/nodes', (req, res) => {
    res.json(blockchain.getNodes());
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});