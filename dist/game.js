!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=18)}([function(e,t,n){"use strict";var r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(2)),s=r(n(3)),i=s.createConnection({host:o.HOST,port:o.PORT,user:o.USER,password:o.PASS,database:o.DB});class c{constructor(e){this.table=e}static parseExpression(e){const t=[];return e.forEach(e=>{const n=e=>t.push(`${r}=${e}`),r=Object.keys(e)[0],o=e[r];switch(typeof o){case"string":n(`"${o}"`);break;case"number":n(o);break;case"object":n(s.escape(JSON.stringify(o)))}}),t}find(...e){return new Promise((t,n)=>{const r=c.parseExpression(e);i.query(`SELECT * FROM ${this.table} WHERE ${r.join(" , ")}`,(e,r)=>{e?n(e):t(r)})})}findOne(...e){return new Promise((t,n)=>{const r=c.parseExpression(e);i.query(`SELECT * FROM ${this.table} WHERE ${r.join(" , ")}`,(e,r)=>{e?n(e):t(r[0])})})}add(...e){return new Promise((t,n)=>{const r=e.map(e=>"object"==typeof e?`'${JSON.stringify(e)}'`:`"${e}"`);i.query(`INSERT INTO ${this.table} VALUES (${r.join(" , ")})`,e=>{e?n(e):t()})})}update(e,t){return new Promise((n,r)=>{const o=c.parseExpression(e),s=c.parseExpression(t);i.query(`UPDATE ${this.table} SET ${s.join(" , ")} WHERE ${o.join(" ")}`,e=>{e?r(e):n()})})}delete(e){return new Promise((t,n)=>{const r=c.parseExpression(e);i.query(`DELETE FROM ${this.table} WHERE ${r.join(" ")}`,e=>{e?n(e):t()})})}}t.default={TABLE:{users:new c("users"),item:new c("item"),session:new c("session"),mobs:new c("mobs")}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{static time(){const e=new Date;return[e.getFullYear(),"-",e.getMonth()+1,"-",e.getDate()," ",e.getHours(),":",e.getMinutes(),":",e.getSeconds(),":",e.getMilliseconds()].join("")}static random(e,t){return Math.floor(Math.random()*(t-e+1)+e)}}},function(e){e.exports=JSON.parse('{"PASS":"ckfejrvkdl4!","PORT":3306,"USER":"root","HOST":"127.0.0.1","DB":"step-by-step"}')},function(e,t){e.exports=require("mysql")},function(e){e.exports=JSON.parse('{"clientID":"85980254947-tbpk5bogtbg9egmsievv1gbmrtmsibel.apps.googleusercontent.com","clientSecret":"vepcxiwShQNOQMLllW8t_VOZ","callbackURL":"http://lotix.kro.kr/auth/google/callback","SESSION_SECRET":"TEST1234"}')},function(e,t,n){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const o=r(n(1));t.default=class{constructor(e,t="green"){this.label=e,this.color=t}trace(e){console.log(`${this.label} | ${o.default.time()} | ${e}`)}}},function(e){e.exports=JSON.parse('{"INTERNAL_WS_URL":"127.0.0.2","WS_PORT":7010}')},,,,,,,,,,,,function(e,t,n){"use strict";var r=this&&this.__awaiter||function(e,t,n,r){return new(n||(n=Promise))((function(o,s){function i(e){try{u(r.next(e))}catch(e){s(e)}}function c(e){try{u(r.throw(e))}catch(e){s(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(i,c)}u((r=r.apply(e,t||[])).next())}))},o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},s=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t};Object.defineProperty(t,"__esModule",{value:!0});const i=o(n(19)),c=o(n(20)),u=o(n(21)),a=s(n(6)),l=s(n(22)),d=s(n(23)),f=s(n(4)),p=o(n(0)),b=o(n(5)),h=o(n(1)),S=c.default.createServer(),_=i.default(S),E=new b.default("GAME","blue"),O={};_.on("connection",e=>r(void 0,void 0,void 0,(function*(){const t=e.id,n=e.handshake.headers.host.split(":")[0];if(n===a.INTERNAL_WS_URL)E.trace("Web server connected."),e.on("disconnect",()=>{E.trace("Web server died.")});else if("127.0.0.3"===n)E.trace("Server Manager connected.");else{E.trace(`Client ${e.id} connected.`);const n=l.parse(e.handshake.headers.cookie)["connect.sid"],o=d.signedCookie(n,f.SESSION_SECRET),s=JSON.parse((yield p.default.TABLE.session.findOne({id:o})).profile).id,i=yield p.default.TABLE.users.findOne({id:s});i.inventory=JSON.parse(i.inventory),O[t]=new u.default(e,t,s),O[t].send("enter",i),function(e){const t=e.id;e.on("searchMob",()=>r(this,void 0,void 0,(function*(){const e=(yield p.default.TABLE.users.findOne({id:O[t].userID})).stage,n=yield p.default.TABLE.mobs.find({stage:e});O[t].send("detectMob",n[h.default.random(0,n.length-1)])})))}(e)}}))),S.listen(a.WS_PORT,()=>{E.trace("Game Server opened : "+a.WS_PORT)})},function(e,t){e.exports=require("socket.io")},function(e,t){e.exports=require("http")},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});class r{constructor(e,t,n){this.socket=e,this.id=t,this.userID=n}send(e,...t){this.socket.emit(e,...t)}}t.default=r,e.exports=r},function(e,t){e.exports=require("cookie")},function(e,t){e.exports=require("cookie-parser")}]);