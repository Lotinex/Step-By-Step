
import Electron from 'electron';
import * as Child_process from 'child_process';

const Path = require("path");
let mainWindow: Electron.BrowserWindow;

let Web: Server;
let Game: Server;

type ServerType = "GAME" | "WEB";
class Server {
    public type: ServerType;
    public process: Child_process.ChildProcessWithoutNullStreams;

    constructor(type: ServerType, path: string){
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


function Engine(){
    mainWindow = new Electron.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });

    mainWindow.loadURL(__dirname + '/view/manager.html');

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

}
function stopServers(){
    if(Web) Web.kill();
    if(Game) Game.kill();
}
function startServers(){
   if(Web && Game) stopServers();
    Game = new Server("GAME", `${Path.resolve(__dirname, '../src/Game/Main.js')}`);
    Web = new Server("WEB", `${Path.resolve(__dirname, '../src/Web/Main.js')}`);
}
Electron.app.whenReady().then(Engine);
