/**
 * 버그가 좀 많다..
 * 피드백은 나중에 구현하도록 하자
 */
class Command {
    
    static TABLE = {};
    static DYNAMIC_ARGS_TYPE = {
        "string" : (arg) => typeof arg === "string",
        "number" : (arg) => !isNaN(arg)
    };
    constructor(cmd){
        this.cmd = cmd;
        this.tree = null;
    }
    static apply(text){
        for(let commandName in Command.TABLE){
            Command.TABLE[commandName].execute(text)
        }
    }
    flow(parsedText, currentTree, argCounter = 1){
        for(let branch in currentTree){
            const argsType = Object.keys(Command.DYNAMIC_ARGS_TYPE).join('|')

            if(branch.match(new RegExp(`<(\\w+)> as (${argsType})`))){
                if(!Command.DYNAMIC_ARGS_TYPE[RegExp.$2](parsedText[argCounter])){
                    return this.onTypeError(RegExp.$1, RegExp.$2, parsedText[argCounter]);
                }
            }

            else if(parsedText[argCounter] !== branch){
                let expectedValues = [];

                for(let value of Object.entries(currentTree)){
                    expectedValues.push(value[0]);
                }
                this.onValueError(expectedValues.join(' 또는 '), parsedText[argCounter]);
                continue;
            }

            const child =  currentTree[branch]();
            if(typeof child == 'object'){ 
                this.flow(parsedText, child, ++argCounter);
                break;
            }
        }
    }
    next(tree){
        this.tree = tree;
        Command.TABLE[this.cmd] = this;
    }
    execute(text){
        const parsedText = text.split(' ');
        if(parsedText[0] !== this.cmd) return;
        return this.flow(parsedText, this.tree);

    }
    onTypeError(branch, expected, current){
        console.log(1)
        document.getElementById("command_tip").innerText = `${branch} 에서, ${expected} 형식이 필요하지만 ${current} 가 입력되었습니다.`
        document.getElementById("command_tip").style.display = 'block';
        
    }
    onValueError(expected, current){
        document.getElementById("command_tip").innerText = `${current} 는 ${expected} 에 맞지 않습니다.`
        document.getElementById("command_tip").style.display = 'block';
    }
}
new Command("effect").next({
    "give" : () => {
        return {
            "<targetID> as string" : () => {

            }
        }
    },
    "clear" : () => {
        return {
            "<targetID> as number" : () => {
            }
        }
    }
})

module.exports = Command;

