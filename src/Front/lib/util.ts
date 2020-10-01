export default class Util {
    static random(start: number, end: number){
        return Math.floor((Math.random() * (end-start+1)) + start)
    }
}