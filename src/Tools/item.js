const DB = require("../DB/Database")
const MySQL = require("mysql")

exports.addItem = async function(itemObject){
    const item = [
        itemObject.id,
        itemObject.price,
        itemObject.reqLV,
        itemObject.rare,
        itemObject.name,
        itemObject.level,
        itemObject.stat,
        itemObject.description,
        itemObject.atk_type,
        itemObject.type
    ]
    const parsedItemString = item.map((data, index) => {
        switch(typeof data){
            case 'string':
                return index == item.length - 1 ? `"${data}` : `"${data}"`;
            case 'number':
                return data;
            case 'object':
                return MySQL.escape(JSON.stringify(data));
        }
    }).join(",");

    await DB.TABLE.item.add(parsedItemString);
}