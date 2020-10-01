
const Electron = require("electron");
const Child_process = require("child_process");
const Path = require("path");
let mainWindow;

let Web;
let Game;

class Server {
    constructor(type, path){
        this.type = type;
        this.process = Child_process.spawn("node", [ path ]);

        this.process.stdout.on('data', data => {
            mainWindow.webContents.send('log', data.toString());
        })
        this.process.stderr.on('data', data => {
			mainWindow.webContents.send('log', data.toString());
        })
        this.process.on('close', () => {
            mainWindow.webContents.send(`${this.type} Server closed.`)
        })
    }
    kill(){
        this.process.kill('SIGINT');
    }
}

function runTerminalCommand(command){
    return new Promise(rs => {
        Child_process.exec(`start cmd.exe /K ${command}`, rs)
    })
}
function Engine(){
    mainWindow = new Electron.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });

    mainWindow.loadURL(Path.resolve(__dirname, '../view/manager.html'));

    Electron.Menu.setApplicationMenu(Electron.Menu.buildFromTemplate([
        {
            label : '서버',
            submenu : [
                {
                    label : '켜기',
                    click: () => startServers()
                },
                {
                    label : '끄기',
                    click: () => stopServers()
                }
            ]
        }
    ]))

    mainWindow.webContents.openDevTools()

}
function stopServers(){
    if(Web) Web.kill();
    if(Game) Game.kill();
}
async function startServers(){
   if(Web && Game) stopServers();
   Game = new Server("GAME", `${Path.resolve(__dirname, '../../dist/game.js')}`);
   Web = new Server("WEB", `${Path.resolve(__dirname, '../../dist/web.js')}`);
}
Electron.app.whenReady().then(Engine);
