import * as Color from 'ansi-colors';
import * as Fs from 'fs';
import Util from '../Tools/Utils';



export default class Lognex { //일단 이 클래스 하나만 둔다. 나중에 재작성한다.
    public label: string;
    public color: string;
    constructor(label: string, color= "green"){
        this.label = label;
        this.color = color;

    }
    trace(value: string){
        /**
         * @deprecated
         * Electron에 로그를 표시할 때 컬러가 깨짐.
         */
        // console.log(`${Color[this.color](this.label)} | ${Color.cyan(Utils.time())} | ${value}`)
        console.log(`${this.label} | ${Util.time()} | ${value}`)

    }
}
