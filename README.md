# Buzzster Guard Node

Este proyecto proporciona un nodo para la app **Guard**. El servidor gestiona la lista de números bloqueados y permite añadir nuevos nodos.

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (gestor de paquetes de Node.js)

## Instalación

1. Clona este repositorio:

   ```bash
   git clone https://github.com/atzitionDEV/guard-node.git
   cd guard-node
   npm install
   npm start

2. Para añadir un peer a tu nodo usa:
   ```
   curl -X POST http://localhost:3000/addNode \
     -H "Content-Type: application/json" \
     -d '{"address": "https://guard.buzzster.co.uk"}'

3. Añade https://guard.buzzster.co.uk y tantos nodos como quieras.