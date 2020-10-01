

import Express from 'express';
import * as Login from './Login';
import DB from '../DB/Database';
import * as TABLE from './json/lang-ko.json';
import RequestHandler from './Request';


export default function Route() {
    const Router = Express.Router();

    Router.get("/game", Login.isAuthenticated, (req, res) => {
        res.render("game");
    })
    Router.get("/", async (req, res) => {
        if(req.session){
            const mySession = await DB.TABLE.session.findOne([{id: req.session.id}]);
            if((new Date() as any) - mySession.createdAt > 3000000){
                await DB.TABLE.session.delete([{id: req.session.id}]);
                req.session.destroy(() => {});
            }
        }
        res.render("index");
    })
    Router.get("/setupLangTable", (req, res) => {
        res.send(`window.LANGUAGE_TABLE = ${JSON.stringify(TABLE)};`);
    })
    
    RequestHandler(Router)

    return Router;
}

