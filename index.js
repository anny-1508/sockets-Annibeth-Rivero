const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

// Almacenar usuarios conectados
const users = new Map();

io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');
    
    socket.on('join', (username) => {
        users.set(socket.id, username);
        // Notificar a todos que un nuevo usuario se unió
        io.emit('user joined', {
            username: username,
            connectedUsers: Array.from(users.values())
        });
    });

    socket.on('chat message', (msg) => {
        const username = users.get(socket.id);
        // Enviar el mensaje a todos, incluyendo quién lo envió
        io.emit('chat message', {
            username: username,
            message: msg
        });
    });

    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            users.delete(socket.id);
            // Notificar a todos que un usuario se fue
            io.emit('user left', {
                username: username,
                connectedUsers: Array.from(users.values())
            });
        }
    });
});

const PORT = 5000;
http.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});