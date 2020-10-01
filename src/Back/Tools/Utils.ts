
export default class Util {
    public static time(){
        const c = new Date();
        return [
            c.getFullYear(),
            '-',
            c.getMonth() + 1,
            '-',
            c.getDate(),
            ' ',
            c.getHours(),
            ':',
            c.getMinutes(),
            ':',
            c.getSeconds(),
            ':',
            c.getMilliseconds()
        ].join('')
    }
    public static random(start: number, end: number){
        return Math.floor((Math.random() * (end-start+1)) + start)
    }
}