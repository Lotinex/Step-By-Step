
import Express from 'express';
import Path from 'path';
import Route from './Route';
import DB from '../DB/Database';
import * as MySQL from 'mysql';
import * as Login from './Login';
import Socket from 'socket.io-client';
import Lognex from '../Tools/Lognex';
import * as GLOBAL from '../../global-config.json';
import passport from 'passport';
import * as bodyParser from 'body-parser';

const App = Express();
const ws = Socket(`ws://${GLOBAL.INTERNAL_WS_URL}:${GLOBAL.WS_PORT}`)
const Logger = new Lognex("WEB", "red");
Login.init(passport, App);

App.use(Express.static(Path.resolve(__dirname, 'assets')))

App.use(bodyParser.urlencoded());
//App.use(bodyParser.json())
 
App.set('views', Path.resolve(__dirname, 'views'))
App.set('view engine', 'pug')

App.use("/", Route());

App.listen(80, () => {
    Logger.trace("Web Server opened.")
})



// 아이템을 임시로 해놓자. 나중에 방식이 바뀐다.
const wooden_sword = {
    price : 100,
    name : "나무 검",
    rare : "normal",
    reqLV : 0,
    level : {
        value : 1,
        star : 1
    },
    stat : {
        atk: 3
    },
    description : "초보자용 나무 검이다.",
    atk_type : "attack",
    type : "sword"

}
const lava_pendant  = {
    price : 100,
    name : "라바 펜던트",
    rare : "legendary",
    reqLV : 250,
    level : {
        value : 167,
        star : 6
    },
    stat : {
        atk: 455,
        def: 20,
        atk_speed: 10,
        ignore_protection: 45,
        critical_chance: 70,
        critical_damage: 4.5

    },
    description : "전설적인 불의 새의 심장에 있는 보석이 박힌 펜던트이다.",
    atk_type : "buff",
    type : "pendant"

}
const trace_of_the_void  = {
    price : 100,
    name : "공허의 흔적",
    rare : "mythic",
    reqLV : 900,
    level : {
        value : 520,
        star : 7
    },
    stat : {
        atk: 1765000


    },
    description : "알 수 없는 공간에서 한 연구원이 떼어 온 공허(보이드) 의 흔적이다.\n주변 공간을 일그러뜨리고 있다.",
    atk_type : "buff",
    type : "pendant"

}
const burning_heart = {
    price : 100,
    name : "버닝 하트",
    rare : "epic",
    reqLV : 85,
    level : {
        value : 47,
        star : 5
    },
    stat : {
        atk: 10,
        health: 100,
        critical_chance: 0,
        critical_damage: 1.5,
        atk_speed: 1,
        def: 0,
        accuracy: 0,
        luck: 0,
        ignore_protection: 0,
        multishot: 0
    },
    description : "전설 속 정의 영혼이 가졌던 불타는 심장이다. 죽지 않고 살아있다.",
    atk_type : "buff",
    type : "pendant"

}
const echani = {
    price : 100,
    name : "에찬이",
    rare : "mythic",
    reqLV : 999,
    level : {
        value : 750,
        star : 7
    },
    stat : {
        atk: 55400,
        ignore_protection: 95,
        critical_chance: 100,
        critical_damage: 12,
        atk_speed: 10,
        health: 500
    },
    description : "에찬이다.",
    atk_type : "buff",
    type : "pendant"

}
const inventory = {
    "wooden_sword" : wooden_sword,
    "lava_pendant" : lava_pendant,
    "trace_of_the_void" : trace_of_the_void,
    "burning_heart" : burning_heart, //테스트
    "echani" : echani
}

DB.TABLE.users.update([ { id : "114771621283891074143" } ], [ { inventory :  inventory } ]) 


