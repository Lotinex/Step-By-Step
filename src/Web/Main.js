const Express = require("express");
const Path = require("path");
const Route = require("./Route");
const DB = require("../DB/Database");
const MySQL = require("mysql");
const Login = require("./Login");
const Socket = require("socket.io-client");
const Color = require("ansi-colors");
const Lognex = require("../Tools/Lognex");
const GLOBAL = require("../global-config.json");

const App = Express();
const ws = Socket(`ws://${GLOBAL.INTERNAL_WS_URL}:${GLOBAL.WS_PORT}`)
const Logger = new Lognex("WEB", "red");
Login.init(App);

App.use(Express.static(`${__dirname}/public`))

App.set('views', `${__dirname}/views`)
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
        STR : "+3"
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
        STR : "+5345",
        IP : "+30%",
        CTD : "+45%",
        DPC : "+30",
        LUK : "+10",
        ACC : "+100%"

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
        STR : "+19345",
        IP : "+95%"

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
        STR : "+450",
        HPD : "+7%",
        EDC : "+4%"


    },
    description : "전설 속 정의 영혼이 가졌던 불타는 심장이다. 죽지 않고 살아있다.",
    atk_type : "buff",
    type : "pendant"

}
const inventory = {
    "wooden_sword" : wooden_sword,
    "lava_pendant" : lava_pendant,
    "trace_of_the_void" : trace_of_the_void,
    "burning_heart" : burning_heart //테스트
}

//DB.TABLE.users.update([ { id : "asdfasdf" } ], [ { inventory :  inventory } ]) 


