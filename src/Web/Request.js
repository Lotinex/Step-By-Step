const Express = require("express");
const Login = require("./Login");
const DB = require("../DB/Database");
const TABLE = require("./json/lang-ko.json");
const Logger = require("../Tools/Lognex");

const STAGE_REQ_LV = {
    'earth' : 0,
    'immune' : 30,
    'eternal_prison' : 55,
    'harbinger_of_end' : 80,
    'arkcube_piece' : 100,
    'loard_down_benzene' : 200
}

/**
 * @param {Express.Router} Router 
 */
module.exports = function(Router){
    Router.post('/changeStage', async (req, res) => {
        const user = await DB.TABLE.users.findOne({id: req.session.profile.id});
        if(user.level >= STAGE_REQ_LV[req.body.stage]){
            await DB.TABLE.users.update([{id: req.session.profile.id}], [{stage: req.body.stage}])
            res.send({success: true})
        } else {
            res.send({success: false})
        }
    })
}

