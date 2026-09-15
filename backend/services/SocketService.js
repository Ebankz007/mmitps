const socketIo = require('socket.io');

let io;

exports.init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // Allow all for now, restrict in production
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('join_room', (room) => {
            socket.join(room);
            console.log(`Socket ${socket.id} joined room ${room}`);
        });

        socket.on('leave_room', (room) => {
            socket.leave(room);
            console.log(`Socket ${socket.id} left room ${room}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

exports.emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

exports.emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
