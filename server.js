const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let userCount = 1;
const users = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    const username = `user${userCount++}`;
    users[socket.id] = username;

    // Notify others
    socket.broadcast.emit('chat message', { user: 'System', msg: `${username} joined the chat.` });

    // Send username to this client
    socket.emit('you', username);

    // Handle incoming messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', { user: users[socket.id], msg });
    });

    socket.on('disconnect', () => {
        io.emit('chat message', { user: 'System', msg: `${users[socket.id]} left the chat.` });
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Chat server listening on port ${PORT}`);
});
