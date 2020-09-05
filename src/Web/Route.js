const Express = require("express");
const Login = require("./Login");
const DB = require("../DB/Database");

module.exports = function(){
    const Router = Express.Router();

    Router.get("/game", Login.isAuthenticated, (req, res) => {
        res.render("game");
    })
    Router.get("/", (req, res) => {
        res.render("index"); //이제 여기에서 사용자 정보를 전달하도록 한다.
    })

    return Router;
}

