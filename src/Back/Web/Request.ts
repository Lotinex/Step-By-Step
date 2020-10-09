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
        const user = await DB.TABLE.users.findOne({id: req.session!.profile.id});
        if(user.level >= (STAGE_REQ_LV as any)[req.body.stage]){
            await DB.TABLE.users.update([{id: req.session!.profile.id}], [{stage: req.body.stage}])
            res.send({success: true})
        } else {
            res.send({success: false})
        }
    })
    Router.post('/equipItem', async (req, res) => {
        const user = await DB.TABLE.users.findOne({id: req.session!.profile.id});
        const updatedEquip = JSON.parse(user.equip);
        updatedEquip[req.body.item] = JSON.parse(user.inventory)[req.body.item];

        await DB.TABLE.users.update([{id: req.session!.profile.id}], [{equip: updatedEquip}]);
        res.send({success: true})
    })
    Router.post('/equipOffItem', async (req, res) => {
        const user = await DB.TABLE.users.findOne({id: req.session!.profile.id});
        const updatedEquip = JSON.parse(user.equip);
        delete updatedEquip[req.body.item];

        await DB.TABLE.users.update([{id: req.session!.profile.id}], [{equip: updatedEquip}])
        res.send({success: true})
    })
}
