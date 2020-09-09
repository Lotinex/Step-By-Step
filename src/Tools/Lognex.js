const Color = require("ansi-colors");
const Fs = require("fs");
const Utils = require("./Utils");


class Logger { //일단 이 클래스 하나만 둔다. 나중에 재작성한다.
    constructor(label, color= "green"){
        this.label = label;
        this.color = color;

    }
    trace(value){
        /**
         * @deprecated
         * Electron에 로그를 표시할 때 컬러가 깨짐.
         */
        // console.log(`${Color[this.color](this.label)} | ${Color.cyan(Utils.time())} | ${value}`)
        console.log(`${this.label} | ${Utils.time()} | ${value}`)

    }
}

module.exports = Logger;