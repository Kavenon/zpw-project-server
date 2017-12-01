const Socket = function () {
    this.clients = [];
};
Socket.prototype.init = function (server) {

    const io = require('socket.io')(server);
    io.on('connection', (client) => {
        console.log('Connected');
        this.clients.push(client);
        client.on('disconnect', () => {
            console.log('Disconnected');
            const i = this.clients.indexOf(client);
            this.clients.splice(i, 1);
        });
    });

};

Socket.prototype.broadcast = function (message) {
    console.log('Will send', message, this.clients.length);
    this.clients.forEach(client => {
        client.emit('messages', message);
    });
};

module.exports = new Socket();
