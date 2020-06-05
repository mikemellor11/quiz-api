module.exports = (socket) => {    
    socket.on('input', message => {
        socket.nsp.emit('output', `<strong>${socket.session && socket.session.name || 'spectator'}</strong>: ${message}`);
    });
}