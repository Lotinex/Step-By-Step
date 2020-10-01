/**
 * 버그가 좀 많다..
 * 피드백은 나중에 구현하도록 하자
 */
var Command = (function () {
    function Command(cmd) {
        this.cmd = cmd;
        this.tree = null;
    }
    Command.apply = function (text) {
        for (var commandName in Command.TABLE) {
            Command.TABLE[commandName].execute(text);
        }
    };
    Command.prototype.flow = function (parsedText, currentTree, argCounter) {
        if (argCounter === void 0) { argCounter = 1; }
        for (var branch in currentTree) {
            var argsType = Object.keys(Command.DYNAMIC_ARGS_TYPE).join('|');
            if (branch.match(new RegExp("<(\\w+)> as (" + argsType + ")"))) {
                if (!Command.DYNAMIC_ARGS_TYPE[RegExp.$2](parsedText[argCounter])) {
                    return this.onTypeError(RegExp.$1, RegExp.$2, parsedText[argCounter]);
                }
            }
            else if (parsedText[argCounter] !== branch) {
                var expectedValues = [];
                for (var _i = 0, _a = Object.entries(currentTree); _i < _a.length; _i++) {
                    var value = _a[_i];
                    expectedValues.push(value[0]);
                }
                this.onValueError(expectedValues.join(' 또는 '), parsedText[argCounter]);
                continue;
            }
            var child = currentTree[branch]();
            if (typeof child == 'object') {
                this.flow(parsedText, child, ++argCounter);
                break;
            }
        }
    };
    Command.prototype.next = function (tree) {
        this.tree = tree;
        Command.TABLE[this.cmd] = this;
    };
    Command.prototype.execute = function (text) {
        var parsedText = text.split(' ');
        if (parsedText[0] !== this.cmd)
            return;
        return this.flow(parsedText, this.tree);
    };
    Command.prototype.onTypeError = function (branch, expected, current) {
        console.log(1);
        document.getElementById("command_tip").innerText = branch + " \uC5D0\uC11C, " + expected + " \uD615\uC2DD\uC774 \uD544\uC694\uD558\uC9C0\uB9CC " + current + " \uAC00 \uC785\uB825\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
        document.getElementById("command_tip").style.display = 'block';
    };
    Command.prototype.onValueError = function (expected, current) {
        document.getElementById("command_tip").innerText = current + " \uB294 " + expected + " \uC5D0 \uB9DE\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";
        document.getElementById("command_tip").style.display = 'block';
    };
    Command.TABLE = {};
    Command.DYNAMIC_ARGS_TYPE = {
        "string": function (arg) { return typeof arg === "string"; },
        "number": function (arg) { return !isNaN(arg); }
    };
    return Command;
})();
exports.default = Command;
new Command("effect").next({
    "give": function () {
        return {
            "<targetID> as string": function () {
            }
        };
    },
    "clear": function () {
        return {
            "<targetID> as number": function () {
            }
        };
    }
});
module.exports = Command;
