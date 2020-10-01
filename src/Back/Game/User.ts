export default class User {
    public socket: SocketIO.Socket;
    public id: string;
    public userID: string;
    constructor(socket: SocketIO.Socket, id: string, userID: string){
        this.socket = socket;
        this.id = id;
        this.userID = userID;
    }
    send(event: string, ...data: any[]){
        this.socket.emit(event, ...data);
    }
}
module.exports = User;