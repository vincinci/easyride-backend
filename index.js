const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

const PORT = process.env.PORT || 3000;


const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');
const locationRoutes = require('./routes/location');
const vehicleRoutes = require('./routes/vehicles');


app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/vehicles', vehicleRoutes);

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    wss.clients.forEach((client) => { 
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Upgrade HTTP server to WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});