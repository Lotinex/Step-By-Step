const MySQL = require("mysql")
const CONFIG = require("./config.json")

const DB = MySQL.createConnection({
    host : CONFIG.HOST,
    port : CONFIG.PORT,
    user : CONFIG.USER,
    password : CONFIG.PASS,
    database : CONFIG.DB,
})
class Table {
    constructor(table){
        this.table = table;
    }
    static parseExpression(expressionArr){
        let parseArr = []
        expressionArr.forEach(expression => {
            const push = value => parseArr.push(`${key}=${value}`)

            let key = Object.keys(expression)[0]
            let value = expression[key];
            switch(typeof value){
                case 'string':
                    push(`"${value}"`)
                    break;
                case 'number':
                    push(value)
                    break;
                case 'object':
                    push(MySQL.escape(JSON.stringify(value)))
                    break;
            }
        })
        return parseArr;
    }
    find(...conditions){
        return new Promise((rs, rj) => {
            let conditionsArr = Table.parseExpression(conditions)

            DB.query(`SELECT * FROM ${this.table} WHERE ${conditionsArr.join(' , ')}`, (err, res) => {
                if(err) rj(err);
                else rs(res);
            })
        })
    }
    add(...values){
        return new Promise((rs, rj) => {
            let valueArr = values.map(v => `"${v}"`);
            DB.query(`INSERT INTO ${this.table} VALUES (${valueArr.join(" , ")})`, err => {
                if(err) rj(err);
                else rs();
            })
        })
    }
    update(conditions, valueExpression){
        return new Promise((rs, rj) => {
            let conditionsArr = Table.parseExpression(conditions)
            let valueArr = Table.parseExpression(valueExpression)

            DB.query(`UPDATE ${this.table} SET ${valueArr.join(' , ')} WHERE ${conditionsArr.join(' ')}`, err => {
                if(err) rj(err);
                else rs();
            })
        })
    }
}
module.exports = {
    TABLE : {
        users : new Table("users"),
        item : new Table("item")
    }
}