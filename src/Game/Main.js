const Socket = require("socket.io");
const Http = require("http");
const Color = require("ansi-colors");
const Lognex = require("../Tools/Lognex");
const User = require("./User");
const GLOBAL = require("../global-config.json");
const Cookie = require("cookie");


const Server = Http.createServer();
const ws = Socket(Server);
const Logger = new Lognex("GAME", "blue");

const Clients = {};

ws.on('connection', socket => {
    const sid = socket.id;
    if(socket.handshake.headers.host.split(':')[0] === GLOBAL.INTERNAL_WS_URL){
        Logger.trace("Web server connected.")
        socket.on('disconnect', () => {
             Logger.trace("Web server died.")
        })
    } else { //어떻게 할지 생각해보자.
        const id = Cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
        console.log(id)
        Clients[sid] = new User(socket, sid);

    }
    Logger.trace(`Client ${socket.id} connected.`)
})
Server.listen(GLOBAL.WS_PORT, () => {
    Logger.trace(`Game Server opened : ${GLOBAL.WS_PORT}`)
})