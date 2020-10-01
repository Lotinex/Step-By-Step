import { Router } from "express";
import Express from 'express';
import * as Login from './Login';
import DB from '../DB/Database';
import * as TABLE from './json/lang-ko.json';
import Lognex from '../Tools/Lognex';

const STAGE_REQ_LV = {
    'earth' : 0,
    'immune' : 30,
    'eternal_prison' : 55,
    'harbinger_of_end' : 80,
    'arkcube_piece' : 100,
    'loard_down_benzene' : 200
}



export default function RequestHandler(Router: Router){
    Router.post('/changeStage', async (req, res) => {
        const user = await DB.TABLE.users.findOne({id: (req.session as globalThis.Express.Session).profile.id});
        if(user.level >= (STAGE_REQ_LV as any)[req.body.stage]){
            await DB.TABLE.users.update([{id: (req.session as globalThis.Express.Session).profile.id}], [{stage: req.body.stage}])
            res.send({success: true})
        } else {
            res.send({success: false})
        }
    })
}
