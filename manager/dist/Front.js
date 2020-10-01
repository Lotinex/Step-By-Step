var electron_1 = require('electron');
var socket_io_client_1 = require('socket.io-client');
var Command_1 = require('./Command');
var ws = socket_io_client_1.default("ws://127.0.0.3:7010");
var ipcRenderer = electron_1.default.ipcRenderer;
var viewCmdConsole = false;
ipcRenderer.on('log', function (_, data) {
    var logBox = document.createElement('div');
    logBox.setAttribute('class', 'logBox');
    logBox.innerText = data;
    document.getElementById('console').append(logBox);
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        var $cmdConsole = document.getElementById("command_console");
        if (!viewCmdConsole) {
            $cmdConsole.style.display = 'block';
            viewCmdConsole = true;
        }
        else {
            $cmdConsole.style.display = 'none';
            viewCmdConsole = false;
        }
    }
});
document.getElementById("command").addEventListener("input", function (e) {
    var input = document.getElementById("command"), as = HTMLInputElement;
    Command_1.default.apply(input.value.slice(1));
});
