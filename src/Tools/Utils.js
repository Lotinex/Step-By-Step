exports.time = function(){
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
exports.random = function(start, end){
    return Math.floor((Math.random() * (end-start+1)) + start)
}