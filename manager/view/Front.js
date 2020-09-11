const Electron = require("electron");
const Socket = require("socket.io-client");
const Command = require("./Command");

const ws = Socket(`ws://127.0.0.3:7010`);

const ipcRenderer = Electron.ipcRenderer;
let viewCmdConsole = false;
ipcRenderer.on('log', (_, data) => {
    const logBox = document.createElement('div');
    logBox.setAttribute('class', 'logBox');

    logBox.innerText = data;
    document.getElementById('console').append(logBox);
})

document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
        const $cmdConsole = document.getElementById("command_console");
        if(!viewCmdConsole){
            $cmdConsole.style.display = 'block';
            viewCmdConsole = true;
        } else {
            $cmdConsole.style.display = 'none';
            viewCmdConsole = false;
        }
    }
})
document.getElementById("command").addEventListener("input", e => {
    Command.apply(document.getElementById("command").value.slice(1))
})