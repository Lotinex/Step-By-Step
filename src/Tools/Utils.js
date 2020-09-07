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