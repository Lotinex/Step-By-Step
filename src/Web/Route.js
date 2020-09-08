const Express = require("express");
const Login = require("./Login");
const DB = require("../DB/Database");
const TABLE = require("./json/lang-ko.json");

module.exports = function(Logger){
    const Router = Express.Router();

    Router.get("/game", Login.isAuthenticated, async (req, res) => {
        Logger.trace(req.session.id)
        res.render("game");
    })
    Router.get("/", (req, res) => {
        res.render("index"); //이제 여기에서 사용자 정보를 전달하도록 한다.
    })
    Router.get("/setupLangTable", (req, res) => {
        res.send(`window.LANGUAGE_TABLE = ${JSON.stringify(TABLE)};`);
    })
    
    return Router;
}

