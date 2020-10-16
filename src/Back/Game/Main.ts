
import Socket from 'socket.io';
import Http from 'http';
import User from './User';
import * as GLOBAL from '../../global-config.json';
import * as Cookie from 'cookie';
import * as CookieParser from 'cookie-parser';
import * as LoginConfig from '../Web/json/login.json';
import DB from '../DB/Database';
import Lognex from '../Tools/Lognex';
import Util from '../Tools/Utils';


const Server = Http.createServer();
const ws = Socket(Server);
const Logger = new Lognex("GAME", "blue");

const Clients: {
    [socketID: string]: User;
} = {};


ws.on('connection', async socket => {
    const SID = socket.id;
    const address = socket.handshake.headers.host.split(':')[0];
    if(address === GLOBAL.INTERNAL_WS_URL){
        Logger.trace("Web server connected.")
        socket.on('disconnect', () => {
             Logger.trace("Web server died.")
        })
    } else if(address === '127.0.0.3'){
        Logger.trace("Server Manager connected.")
        // 매니저에 대한 disconnect는 처리하지 않는다.
        // (어짜피 걔가 죽으면 서버 두개가 다 죽는다.)
    } else { 
        Logger.trace(`Client ${socket.id} connected.`);


        const sidCookie = Cookie.parse(socket.handshake.headers.cookie)['connect.sid'];
        const sessionID = CookieParser.signedCookie(sidCookie, LoginConfig.SESSION_SECRET);

        const userID = JSON.parse((await DB.TABLE.session.findOne({id: sessionID})).profile).id;
        const user = await DB.TABLE.users.findOne({id: userID});

        user.inventory = JSON.parse(user.inventory);
        user.stat = JSON.parse(user.stat);
        user.equip = JSON.parse(user.equip);
        console.log(user.level)

        Clients[SID] = new User(socket, SID, userID);
        Clients[SID].send("enter", user);

        onUserSocketRequest(socket)

    }
})
function onUserSocketRequest(socket: SocketIO.Socket){
    const SID = socket.id;

    socket.on('searchMob', async () => {
        const stage = (await DB.TABLE.users.findOne({id: Clients[SID].userID})).stage;
        const mobs = await DB.TABLE.mobs.find({stage});
        Clients[SID].send("detectMob", mobs[Util.random(0, mobs.length - 1)])
    })
    socket.on('upgradeItem', async (itemID: string, itemData: any) => {
        const chance = 1 - itemData.upgradeLv * 0.055; //점차 확률 감소
        if(Math.random() < chance){ //success
            const user = await DB.TABLE.users.findOne({id: Clients[SID].userID});
            const inventory = JSON.parse(user.inventory);

            for(const stat in inventory[itemID].stat){
                const value: number = inventory[itemID].stat[stat]

                if(!inventory[itemID].upgradedStat[stat]) inventory[itemID].upgradedStat[stat] = 0;

                const addedStatScaled = Number((value * (5 + itemData.upgradeLv * 4.5) / 100).toFixed(1));
                const addedStatDefault = Number((value * 5 / 100).toFixed(1));

                const addedStat = Number(Util.random(addedStatDefault, addedStatScaled).toFixed(1));
                console.log(itemData.upgradeLv)
                inventory[itemID].upgradedStat[stat] += addedStat //스탯 추가 능력치 별도 저징
                inventory[itemID].stat[stat] = value + addedStat //퍼센트 추가 적용 (강화 레벨에 비례)
            }
            inventory[itemID].upgradeLv += 1;
            await DB.TABLE.users.update([{id: Clients[SID].userID}], [{inventory}]) 
            Clients[SID].send('upgradeResponse', {
                success: true,
                id: itemID,
                data: inventory
            })
        } else { //failed
            Clients[SID].send('upgradeResponse', {
                success: false
            })
        }
    })
    /*
    socket.on('equipItem', async (item: string) => {
        const user = await DB.TABLE.users.findOne({id: Clients[SID].userID});
        const updatedEquip = JSON.parse(user.equip);
        updatedEquip[item] = JSON.parse(user.inventory)[item];

        await DB.TABLE.users.update([{id: Clients[SID]}], [{equip: updatedEquip}])

        Clients[SID].send("equipOK")
    })
    socket.on('equipOffItem', async (item: string) => {
        const user = await DB.TABLE.users.findOne({id: Clients[SID].userID});
        const updatedEquip = JSON.parse(user.equip);
        delete updatedEquip[item];

        await DB.TABLE.users.update([{id: Clients[SID].userID}], [{equip: updatedEquip}])

        Clients[SID].send("equipOffOK")
    })*/

}

Server.listen(GLOBAL.WS_PORT, () => {
    Logger.trace(`Game Server opened : ${GLOBAL.WS_PORT}`)
})

