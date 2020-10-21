
import * as CONFIG from './config.json';
import * as MySQL from 'mysql';

const DB = MySQL.createConnection({
    host : CONFIG.HOST,
    port : CONFIG.PORT,
    user : CONFIG.USER,
    password : CONFIG.PASS,
    database : CONFIG.DB,
})
class Table<T extends "users" | "mobs" | "session" | "item" | "boss"> {
    private table: T;
    constructor(table: T){
        this.table = table;
    }
    static parseExpression(expressionArr: Array<{[key: string]: any}>){
        const parseArr: string[] = []
        expressionArr.forEach(expression => {
            const push = (value: string | number) => parseArr.push(`${key}=${value}`)

            const key = Object.keys(expression)[0]
            const value = expression[key];
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
    find(...conditions: Array<{[key: string]: any}>): Promise<Database.Units[T][]>{
        return new Promise((rs, rj) => {
            const conditionsArr = Table.parseExpression(conditions)

            DB.query(`SELECT * FROM ${this.table} WHERE ${conditionsArr.join(' , ')}`, (err, res) => {
                if(err) rj(err);
                else rs(res);
            })
        })
    }
    findOne(...conditions: Array<{[key: string]: any}>): Promise<Database.Units[T]>{
        return new Promise((rs, rj) => {
            const conditionsArr = Table.parseExpression(conditions)
            DB.query(`SELECT * FROM ${this.table} WHERE ${conditionsArr.join(' , ')}`, (err, res) => {
                if(err) rj(err);
                else rs(res[0]); //? 사실 이럴 일이 없어야 한다. 왜 배열이 나오지?  -> LIMIT 1 deprecated
            })
        })
    }
    add(...values: any[]){
        return new Promise((rs, rj) => {
            const valueArr = values.map(v => {
                if(typeof v == 'object') return `'${JSON.stringify(v)}'`;
                return `"${v}"`;
            });
            DB.query(`INSERT INTO ${this.table} VALUES (${valueArr.join(" , ")})`, err => {
                if(err) rj(err);
                else rs();
            })
        })
    }
    update(conditions: Array<{[key: string]: any}>, valueExpression: Array<{[key: string]: any}>){
        return new Promise((rs, rj) => {
            const conditionsArr = Table.parseExpression(conditions)
            const valueArr = Table.parseExpression(valueExpression)
            DB.query(`UPDATE ${this.table} SET ${valueArr.join(' , ')} WHERE ${conditionsArr.join(' ')}`, err => {
                if(err) rj(err);
                else rs();
            })
        })
    }
    delete(conditions: Array<{[key: string]: any}>){
        return new Promise((rs, rj) => {
            const conditionsArr = Table.parseExpression(conditions)
            DB.query(`DELETE FROM ${this.table} WHERE ${conditionsArr.join(' ')}`, err => {
                if(err) rj(err);
                else rs();
            })
        })
    }
}



export default {
    TABLE: {
        users: new Table("users"),
        item: new Table("item"),
        session: new Table("session"),
        mobs: new Table("mobs"),
        boss: new Table("boss")
    }
};