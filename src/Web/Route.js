const Express = require("express");
const Login = require("./Login");
const DB = require("../DB/Database");
const TABLE = require("./json/lang-ko.json");
const Logger = require("../Tools/Lognex");
const Request = require("./Request");

module.exports = function(){
    const Router = Express.Router();

    Router.get("/game", Login.isAuthenticated, (req, res) => {
        res.render("game");
    })
    Router.get("/", async (req, res) => {
        if(req.session){
            const mySession = await DB.TABLE.session.findOne([{id: req.session.id}]);
            if(new Date() - mySession.createdAt > 3000000){
                await DB.TABLE.session.delete([{id: req.session.id}]);
                req.session.destroy();
            }
        }
        res.render("index");
    })
    Router.get("/setupLangTable", (req, res) => {
        res.send(`window.LANGUAGE_TABLE = ${JSON.stringify(TABLE)};`);
    })
    
    Request(Router)

    return Router;
}

