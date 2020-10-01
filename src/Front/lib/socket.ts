import io from 'socket.io-client';

export default class SocketClient {
    ws: SocketIOClient.Socket;
    static PORT = 7010;
    constructor(url?: string){
        const connectURL = url || `${window.location.origin}:${SocketClient.PORT}`
        this.ws = io(connectURL);
    }
    send(event: string, ...data: any[]){
        this.ws.emit(event, ...data)
    }
    on(event: string, receiver: (...args: any[]) => void){
        this.ws.on(event, receiver)
    }
}