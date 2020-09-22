class User {
    constructor(socket, id, userID){
        this.socket = socket;
        this.id = id;
        this.userID = userID;
    }
    send(event, ...data){
        this.socket.emit(event, ...data);
    }
}
module.exports = User;