class User {
    constructor(socket, id){
        this.socket = socket;
        this.id = id;
    }
    send(event, ...data){
        this.socket.emit(event, ...data);
    }
}
module.exports = User;