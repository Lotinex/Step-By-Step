class Socket {
    static PORT = 7010;
    constructor(url){
        let connectURL = url || `${window.location.origin}:${Socket.PORT}`
        this.ws = io(connectURL);
    }
    send(event, ...data){
        this.ws.emit(event, ...data)
    }
    receive(event, receiver){
        this.ws.on(event, receiver)
    }
}