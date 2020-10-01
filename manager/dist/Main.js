var electron_1 = require('electron');
var Child_process = require('child_process');
var Path = require("path");
var mainWindow;
var Web;
var Game;
"GAME" | "WEB";
var Server = (function () {
    function Server(type, path) {
        var _this = this;
        this.type = type;
        this.process = Child_process.spawn("node", [path]);
        this.process.stdout.on('data', function (data) {
            mainWindow.webContents.send('log', data.toString());
        });
        this.process.stderr.on('data', function (data) {
            mainWindow.webContents.send('log', data.toString());
        });
        this.process.on('close', function () {
            mainWindow.webContents.send(_this.type + " Server closed.");
        });
    }
    Server.prototype.kill = function () {
        this.process.kill('SIGINT');
    };
    return Server;
})();
function Engine() {
    mainWindow = new electron_1.default.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });
    mainWindow.loadURL(__dirname + '/view/manager.html');
    electron_1.default.Menu.setApplicationMenu(electron_1.default.Menu.buildFromTemplate([
        {
            label: '서버',
            submenu: [
                {
                    label: '켜기',
                    click: function () { return startServers(); }
                },
                {
                    label: '끄기',
                    click: function () { return stopServers(); }
                }
            ]
        }
    ]));
}
function stopServers() {
    if (Web)
        Web.kill();
    if (Game)
        Game.kill();
}
function startServers() {
    if (Web && Game)
        stopServers();
    Game = new Server("GAME", "" + Path.resolve(__dirname, '../src/Game/Main.js'));
    Web = new Server("WEB", "" + Path.resolve(__dirname, '../src/Web/Main.js'));
}
electron_1.default.app.whenReady().then(Engine);
