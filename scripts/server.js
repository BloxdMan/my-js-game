// server.js - Simple Local Server for Bloxd.io Fan Game
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve basic status
app.get('/', (req, res) => {
  res.send('Bloxd Fan Server Running...');
});

// Store connected players
let players = {};

io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);

  // New player joined
  socket.on('newPlayer', data => {
    players[socket.id] = data;
    socket.broadcast.emit('playerJoined', { id: socket.id, data });
  });

  // Handle player movement
  socket.on('move', data => {
    if (players[socket.id]) {
      players[socket.id].pos = data.pos;
      socket.broadcast.emit('playerMoved', { id: socket.id, pos: data.pos });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    delete players[socket.id];
    socket.broadcast.emit('playerLeft', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
