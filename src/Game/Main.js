const Socket = require("socket.io");
const Http = require("http");

const Server = Http.createServer();
const ws = Socket(Server);

ws.on('connection', socket => {
    console.log(`${socket.id} connected.`)
})

Server.listen(7010, () => {
    console.log("Game server opened.")
})