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
    const address = socket.handshake.headers.host.split(':')[0];
    if(address === GLOBAL.INTERNAL_WS_URL){
        Logger.trace("Web server connected.")
        socket.on('disconnect', () => {
             Logger.trace("Web server died.")
        })
    } else if(address === '127.0.0.3'){
        Logger.trace("Server Manager connected.")
        // 매니저에 대한 disconnect는 처리하지 않는다.
        // (어짜피 걔가 죽으면 서버 두개가 다 죽는다.)
    } else { //어떻게 할지 생각해보자.
        Logger.trace(`Client ${socket.id} connected.`)
        const id = Cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
        Clients[sid] = new User(socket, sid);

    }
})
Server.listen(GLOBAL.WS_PORT, () => {
    Logger.trace(`Game Server opened : ${GLOBAL.WS_PORT}`)
})