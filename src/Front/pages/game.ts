import SocketClient from '../lib/socket';
import ActiveSkill from '../lib/skill';
import XHR from '../lib/xhr';
import {GraphicRenderer, GraphicDamageRenderer} from '../lib/graphic';
import $ from 'jquery';
import EnemyClasses from '../lib/mobs';
import {Enemy} from '../lib/enemy';
import {PlayerAttackProjectile} from '../lib/projectile';
import Hpbar from '../lib/hpbar';
import L from '../lib/language'
import Util from '../lib/util'

export default class Player {
    public static CONFIG = {
        STAR_LIMIT : 7,
        test: 1
    };

    public static Inventory: PlayerData.Inventory = {};
    public static Common: Partial<PlayerData.Common> = {};
    public static Stat: Partial<PlayerData.Stat> = {}
    private static State: PlayerData.State = {
        upgrading: false,
        itemUpdated: false,
    };
    public static Equip: PlayerData.Equip = {};
    public static CurrentTarget?: Partial<PlayerData.CurrentTarget> = {};
    public static CursorPosition: PlayerData.CursorPosition = {
        x: 0,
        y: 0
    };
    public static Skills: PlayerData.Skills = {};

    public static StageRenderer = new GraphicRenderer<Enemy>("stage");
    public static DamageRenderer = new GraphicDamageRenderer("damage-text");
    public static ObjectRenderer = new GraphicRenderer("objects");
    public static EnemyEffectRenderer = new GraphicRenderer("enemy-effect");
    public static MyEffectRenderer = new GraphicRenderer("my-effect");
    public static ws = new SocketClient();

    public static Init(): void {
        Player.onEnter()
        Player.onSocketMessage()
        $(document).on("keydown", event => Player.onKeyboardEvent(event.key))
        $(document).on("mousemove", Player.onMouseMove)
        $(".dialog-close").on("click", e => {
            $(e.currentTarget).parent().parent().hide()
        })

        Player.setupInventoryMenuExplain()
        Player.setupInventoryMenuUse()
        
    }
    public static showDialog(dialogID: string): void {
        const dialog = $(`#${dialogID}`);

        dialog.css({
			'left': ($(window).width()! - dialog.width()!) * 0.5,
			'top': ($(window).height()! - dialog.height()!) * 0.5
		}).show()
    }
    public static setState(stateObject: Partial<PlayerData.State>): void {
        let state: keyof PlayerData.State
        for(state in stateObject){
            const value = stateObject[state]!;
            Player.State[state] = value;
            Player.onStateChange(state, value);
        }
    }
    /**@deprecated */
    public static setStateNoEmit<T extends keyof PlayerData.State>(key: T, value: PlayerData.State[T]): void {
        Player.State[key] = value;
    }
    public static onStateChange<T extends keyof PlayerData.State>(state: T, value: PlayerData.State[T]): void {
        switch(state){
            case 'upgrading':
                if(value){
                    $("#Inventory").addClass('inventory-upgradeReady')
                    $("#Inventory").children(".dialog-head").children("span").text(L.process("state_upgradeReady"))
                } else {
                    $("#Inventory").removeClass('inventory-upgradeReady')
                    $("#Inventory").children(".dialog-head").children("span").text(L.process("title_inventory"))
                }
                break;
        }
    }
    public static setupInventoryMenuExplain(): void {
        $(".inventoryMenu").on('mouseenter', e => {
             Player.Common.currentTooltip = $("#normalTextTooltip");
            $("#normalTextTooltip").text(L.process($(e.currentTarget).attr('id') as string))
            $("#normalTextTooltip").show()
        })
        .on('mouseleave', e => {
            Player.Common.currentTooltip = undefined;
            $("#normalTextTooltip").empty()
            $("#normalTextTooltip").hide()
        })
    }
    public static setupInventoryMenuUse(): void {
        $("#upgradeButton").on('click', e => {
            Player.setState({
                upgrading: !Player.State.upgrading
            })
        })
    }
    public static equipNumber(): number {
        return Object.keys(Player.Equip).length;
    }
    public static drag(): void {
        $(".dialog-head").on('mousedown', e => {
            const dialog = $(e.currentTarget).parent();
          const offsetX = e.clientX - parseInt(dialog.css("left"))
          const offsetY = e.clientY - parseInt(dialog.css("top"))
          
          function mouseMoveHandler(e: JQuery.MouseMoveEvent<any>) {
            dialog.css("left", (e.clientX - offsetX))
            dialog.css("top", (e.clientY - offsetY))
          }
      
          function reset() {
            $(window).off('mousemove', mouseMoveHandler)
            $(window).off('mouseup', reset)
          }
          $(window).on('mousemove', mouseMoveHandler)
          $(window).on('mouseup', reset)
        })
    }
    public static renderStat(): void {
        $("#statBox").empty()
        let key: keyof PlayerData.Stat;
        for(key in Player.Stat){
            const currentStatInfo = L.process(`statinfo_${key}`)
            $("#statBox").append(
                $("<div>").addClass("stat")
                    .append(
                        $("<img>").attr("src", `img/icons/${key}.png`).addClass("statIcon")
                    )
                    .append(
                        $("<div>").addClass("stat-title").text(L.process(`playerstat_${key}`))
                        .on('mouseenter', e => {
                            Player.Common.currentTooltip = $("#normalTextTooltip");
                            $("#normalTextTooltip").text(currentStatInfo)
                            $("#normalTextTooltip").show()
                        })
                        .on('mouseleave', e => {
                            Player.Common.currentTooltip = undefined;
                            $("#normalTextTooltip").empty()
                            $("#normalTextTooltip").hide()
                        })
                    )
                    .append(
                        $("<div>").addClass("stat-value").text(Player.Stat[key] as number)
                    )
            )
        }
    }
    public static dragMap(): void {
        let position = { top: 0, left: 0, x: 0, y: 0 };
    
        const mouseDown = (e: JQuery.MouseDownEvent<any>) => {
            position = {
                top: $("#map").scrollTop() as number,
                left: $("#map").scrollLeft() as number,
                x: e.pageX,
                y: e.pageY
            }
            $(document).on('mousemove', mouseMove)
            $(document).on('mouseup', mouseUp)
        }
        const mouseMove = (e: JQuery.MouseMoveEvent<any>) => {
            const dx = e.pageX - position.x;
            const dy = e.pageY - position.y;
    
            $("#map").scrollTop(position.top - dy)
            $("#map").scrollLeft(position.left - dx)
        }
        const mouseUp = (e: JQuery.MouseUpEvent<any>) => {
            $(document).off('mousemove', mouseMove)
            $(document).off('mouseup', mouseUp)
        }
    
        $("#map").on('mousedown', mouseDown)
    
    }
    public static updateMyHealth(value: number): void {
        Player.Common.health = value;
        $("#profile-hpbarGage").css("width", `${Player.Common.health as number * (100 / Player.Stat.health!)}%`)
    }
    public static showStat(): void {
        if($("#Stat").css("display") == "none"){
            Player.renderStat()
            Player.showDialog("Stat")
        }
        else $("#Stat").hide()
    }
    public static displayEnemyHpbar(name: string, limit: number): void {
        Player.Common.currentEnemyHpbar = new Hpbar(name, limit);
    }
    public static spawnMob(mob: {
        id: keyof typeof EnemyClasses
        stage: string;
        level: string;
        hp: string;
        frame: string;
    }): void {
        const newMob = new EnemyClasses[mob.id](mob.id, 700, 300, 450, 450);
        Player.displayEnemyHpbar(mob.id, parseInt(mob.hp))
        newMob.setHp(parseInt(mob.hp))
        newMob.setAnimatedTexture({
            template: `mobs/${mob.id}/${mob.id}`,
            limit: parseInt(mob.frame)
        })
        newMob.action()
        Player.StageRenderer.addEntity(newMob)
    }
    public static alert(value: string): void {
        $("#alert-box").text(value)
        Player.showDialog("Alert")
    }
    public static fightAlert(): void {
        let bgEffectAlpha = 0;
        const disappear = () => {
            $("#fightAlert").animate({
                "opacity": "0"
            }, {
                step : () => {
                    $("#fightAlert").css("transform", "scale(1.1)")
                    $("#stageBackImage").css("background", `rgba(0,0,0,${bgEffectAlpha})`)
                    bgEffectAlpha -= 0.1;
                },
                duration : 400,
                complete : () => {
                    setTimeout(() => {
                        $("#fightAlert").hide()
                        $("#fightAlert").css("transform", `scale(1)`)
                    }, 100)
                }
            })
        }
        $("#fightAlert").css("display", "flex")
        $("#fightAlert").animate({
            "opacity": "1"
        }, {
            step : () => {
                $("#fightAlert").css("transform", `scale(1.6)`)
                $("#stageBackImage").css("background", `rgba(0,0,0,${bgEffectAlpha})`)
                bgEffectAlpha += 0.1;
            },
            duration : 300,
            complete : () => {
                $("#fightAlert").css("transform", `scale(1)`)
                setTimeout(disappear, 500)
            }
        })
    }
    public static confirm(value: string): Promise<boolean> {
        return new Promise(rs => {
            $("#confirm-box").text(value)
            Player.showDialog("Confirm")
            $("#confirm-ok").on('click', e => {
                $("#Confirm").hide()
                rs(true)
            })
            $("#confirm-no").on('click', e => {
                $("#Confirm").hide()
                rs(false)
            })
        })
    }
    public static customConfirm(dialog: JQuery, ok: JQuery, no: JQuery): Promise<boolean> {
        return new Promise(rs => {
            Player.showDialog(dialog.attr("id")!)
            ok.on('click', e => {
                dialog.hide()
                rs(true)
            })
            no.on('click', e => {
                dialog.hide()
                rs(false)
            })
        })
    }
    public static toggle(target: JQuery): JQuery<HTMLElement> {
        if(target.css("display") === "none"){
            target.show()
        } else target.hide()
        return target;
    }
    public static toggleDialog(target: JQuery): JQuery<HTMLElement> {
        if(target.css("display") === "none"){
            target.css({
                'left': ($(window).width()! - target.width()!) * 0.5,
                'top': ($(window).height()! - target.height()!) * 0.5
            }).show()
        } else target.hide()
        return target;
    }
    public static onMouseMove(event: JQuery.MouseMoveEvent<Document, undefined, Document, Document>): void {
        Player.CursorPosition = {
            x: event.pageX,
            y: event.pageY
        }
        if(Player.Common.currentTooltip){
            let dx = 0;
            let dy = 0;
            switch(Player.Common.currentTooltip.attr('id')){
                case "normalTextTooltip":
                    dx = 20;
                    dy = -15;
                    break;
                case "itemTooltip":
                    dx = 20;
                    dy = -10;
                    break;
            }
            Player.Common.currentTooltip.css("left", event.pageX + dx)
            Player.Common.currentTooltip.css("top", event.pageY + dy)
        }
    }
    public static attack(){

        if(!Player.CurrentTarget) return; //타겟팅이 어무것도 안 되어 있을 때
        const projectile = new PlayerAttackProjectile(`my-projectile-${Player.Common.projectileCounter}`, Player.CursorPosition?.x as number, Player.CursorPosition?.y as number);
        projectile.setSize(10, 10)
        projectile.setRenderer(Player.MyEffectRenderer)
        projectile.isSmooth = true;
        projectile.setTexture({
            src: 'img/items/trace_of_the_void.png',
            width: 5,
            height: 5
        })
        Player.MyEffectRenderer.addEntity(projectile)
        projectile.moveTo(Player.CurrentTarget.x as number, Player.CurrentTarget.y as number, 0.5);
    
        (Player.Common.projectileCounter as number)++;
    
    }
    public static onKeyboardEvent(key: string): void {
        switch(key){
            case 'm':
                Player.toggle($("#map"))
                break;
            case 'k':
                if($("#skill").css("margin-bottom") === "-130px"){
                    $("#skill").animate({
                        "margin-bottom": 30
                    }, 300)
                } else {
                    $("#skill").animate({
                        "margin-bottom": -130
                    }, 300)
                }
                break;
            case 'i':
                Player.toggleDialog($("#Inventory"))
                break;
            case 'Shift':
                Player.attack()
                break;
            case 'l':
                Player.showStat()
                break;
        }
    }
    public static upgradeItem(itemID: string, itemData: any): void {
        const chancePercent = ~~((1 - itemData.upgradeLv * 0.055) * 100);
        $("#upgrade-itemImg").attr("src", `img/items/${itemID}.png`)
        $("#upgrade-itemName").addClass(`rare-${itemData.rare}`).text(itemData.name)
        $("#upgrade-description").text("이 장비를 강화합니다.")

        $("#upgrade-gold").text(1)
        $("#upgrade-lv").html('')
        $("#upgrade-lv")
        .append(
            $("<span>").text(itemData.upgradeLv)
        )
        .append(
            $("<i>").attr("class", "fas fa-angle-double-right upgrade-arrow")
        )
        .append(
            $("<span>").text(itemData.upgradeLv + 1)
        )
        let chanceColorClass: string = "";
        if(chancePercent < 10){
            chanceColorClass = "upgrade-chance-veryLow"
        } else if(chancePercent < 40){
            chanceColorClass = "upgrade-chance-low"
        } else if(chancePercent < 65){
            chanceColorClass = "upgrade-chance-mid"
        } else if(chancePercent < 85){
            chanceColorClass = "upgrade-chance-high"
        } else if(chancePercent <= 100){
            chanceColorClass = "upgrade-chance-veryHigh"
        }
        $("#upgrade-chance").attr("class", "upgrade-infoValue")
        $("#upgrade-chance").text(`${chancePercent}%`).addClass(chanceColorClass)
        const upgradeStatValue: {[statName: string]: number} = {};
        const appliedStat : {[statName: string]: number} = {};
        const itemStat = Player.Inventory[itemID].stat;

        for(const stat in itemStat){
            const addedStatScaled = Number((itemStat[stat] * (5 + itemData.upgradeLv * 4.5) / 100).toFixed(1));
            const addedStatDefault = Number((itemStat[stat] * 5 / 100).toFixed(1));
            const addedStat = Number(Util.random(addedStatDefault, addedStatScaled).toFixed(1));
            appliedStat[stat] = addedStat;
            upgradeStatValue[stat] = itemStat[stat] + addedStat;
        }
        $("#upgrade-stat-info").html('');
        for(const stat in itemData.stat){
            $("#upgrade-stat-info").append(
                $("<div>").addClass("upgrade-stat-value")
                .append(
                    $("<img>").addClass("upgrade-stat-img").attr("src", `img/icons/${stat}.png`)
                )
                .append(
                    $("<div>").addClass("upgrade-stat-text")
                    .append(
                        $("<span>").text(itemStat[stat])
                    )
                    .append(
                        $("<i>").attr("class", "fas fa-angle-double-right upgrade-arrow")
                    )
                    .append(
                        $("<span>").text(upgradeStatValue[stat])
                    )
                    .append(
                        $("<span>").addClass("itemTooltip-stat-additional").text(`(+${upgradeStatValue[stat] - itemStat[stat]})`)
                    )
                )
            )
        }
        Player.customConfirm($("#UpgradeConfirm"), $("#upgrade-confirm-ok"), $("#upgrade-confirm-no")).then(res => {
            if(res) {
                if(Math.random() < chancePercent / 100){ //success
                    Player.ws.send('upgradeItem', itemID, upgradeStatValue, appliedStat)
                } else {
                    Player.alert(L.process('upgrade_failed'))
                }
            }
        })
    }
    public static registerItemTooltip(items: any): void {
        $(".item-box").hover(e => {
            const item = $(e.currentTarget).attr("item") as string;
            console.log(item)
            const itemData = items[item];

            $("#itemTooltip").show();
            let itemNameColor;
            switch(itemData.rare){
                case 'normal':
                    itemNameColor = 'gray';
                    break;
                case 'rare':
                    itemNameColor = 'lightgreen';
                    break;
                case 'epic':
                    itemNameColor = 'lightblue';
                    break;
                case 'legendary':
                    itemNameColor = 'gold';
                    break;
                case 'mythic':
                    itemNameColor = 'red';
                    break;


            }
            $("#itemTooltip-name").html(`<span style="color:${itemNameColor};">${itemData.name}</span><span style="color:yellow;text-shadow:0px 0px 2px yellow;">(+${itemData.upgradeLv})</span>`);
            $("#itemTooltip-rare").text(itemData.rare).attr("class", `rare-${itemData.rare}`)
            $("#itemTooltip-level").text(`Lv.${itemData.level.value}`);
            $("#itemTooltip-reqLV").text(`reqLv.${itemData.reqLV}`);
            $("#itemTooltip-statBox").html('');
            for(const stat in itemData.stat){
                $("#itemTooltip-statBox").append(
                    $("<div>").addClass("itemTooltip-stat-value")
                    .append(
                        $("<img>").addClass("itemTooltip-stat-img").attr("src", `img/icons/${stat}.png`)
                    )
                    .append(
                        $("<div>").addClass("itemTooltip-stat-text")
                        .append($("<span>").text(itemData.stat[stat]))
                        .append($("<span>").addClass("itemTooltip-stat-additional").text(`(+${itemData.upgradedStat[stat] || 0})`))
                    )
                )
            }
            let star = '';
            for(let i=0; i<itemData.level.star; i++){ //별을 반 개씩 카운트하는건 아직 만들지 않았다.
                star += "★";
            }
            for(let i=0; i<Player.CONFIG.STAR_LIMIT - itemData.level.star; i++){
                star += "☆";
            }

            $("#itemTooltip-star").text(star)
            $("#itemTooltip-img").attr("src", `img/items/${item}.png`) //이미지를 나중에 분류해놓자.
            $("#itemTooltip-description").text(itemData.description);
            Player.Common.currentTooltip = $("#itemTooltip") //테스트

        }, () => {
            Player.Common.currentTooltip = undefined; //테스트
            $("#itemTooltip").hide();
        })
    }
    public static renderItem(): void {
        $("#inventory-box").html('') //초기회
        for(const item in Player.Inventory){
            const id = item;
            const itemData = Player.Inventory[item];
    
            let equiped = (Player.Equip as PlayerData.Equip).hasOwnProperty(id);
            function equipItem(id: string, itemData: any){
                if(equiped){
                    XHR.POST('/equipOffItem', {
                        item: id,
                        stat: itemData.stat
                    }).then(res => {
                        if(res.success){
                            Player.Stat = res.stat;
                            Player.renderStat()
                            delete (Player.Equip as PlayerData.Equip)[id];
                            equiped = false;
                            itemBox.removeClass("item-box-equiped");
                        }
                    })
                } else {
                    if(Player.equipNumber() === 4) return alert("아이템은 4개까지 착용할 수 있습니다."); //나중에 다이얼로그 알림으로 고치자.
                    XHR.POST('/equipItem', {
                        item: id,
                        stat: itemData.stat
                    }).then(res => {
                        if(res.success){
                            Player.Stat = res.stat;
                            Player.renderStat();
                            (Player.Equip as PlayerData.Equip)[id] = itemData;
                            equiped = true;
                            itemBox.addClass("item-box-equiped");
                        }
                    })
                }
            }
            const itemBox = 
                $("<div>").addClass("item-box")
                    .append($("<img>").addClass("item-img").attr("src", `img/items/${item}.png`))
                    .attr("item", id)
                    .on('click', e => {
                        if(Player.State.upgrading){
                            if(equiped) return Player.alert(L.process('upgrade_unequip_required'));

                            Player.upgradeItem(id, itemData)

                        } else {
                            let equipItemData = itemData;
                            if(Player.State.itemUpdated){
                                equipItemData = Player.Inventory[id];
                                Player.setState({itemUpdated: false})
                            }
                            equipItem(id, Player.Inventory[id])
                        }
                    })
            if(equiped) itemBox.addClass("item-box-equiped");
            $("#inventory-box").append(itemBox)
        }
        Player.registerItemTooltip(Player.Inventory)
    }
    public static onEnter(): void {
        Player.ws.on('enter', data => {
            Player.Equip = data.equip;
            Player.Inventory = data.inventory;
            Player.Stat = data.stat;
            Player.Common.nickname = data.nickname;
            Player.Common.health = data.health;
            Player.Common.stage = data.stage;
            Player.Common.projectileCounter = 0;
            Player.Common.level = data.level;
            Player.Common.money = data.money;
            
            Player.Skills["detection"] = new ActiveSkill("detection", "p");
            Player.Skills["detection"].use = () => {
                Player.ws.send("searchMob")
            };
        
            Player.dragMap()
            Player.drag()
            Player.renderItem()
        
        
            $(".renderer").attr("width", window.innerWidth)
            $(".renderer").attr("height", window.innerHeight)
            $("#profile-name").text(Player.Common.nickname as string)
            $("#profile-level").text(`Lv.${Player.Common.level as number}`)
        
            $("#profile-hpbarGage").css("width", `${Player.Common.health as number * (100 / Player.Stat!.health!)}%`)
            $(".stage").on('click', e => {
                const stage = $(e.currentTarget).attr('id');
                XHR.POST('/changeStage', { stage }).then(res => {
                    if(res.success) Player.changeStage(stage!)
                }).catch(e => {
                    console.error(e)
                })
            })
            $(".dialog-close").on("click", e => {
                $(e.currentTarget).parent().parent().hide()
            })
            Player.updateMyHealth(40)
        
        })
    }
    public static sceneTraisitionEffect(): void {
        $("#sceneTransition").removeClass("transitionAnimated")
        $("#sceneTransition").css("background", "black")
        $("#sceneTransition").addClass("transitionAnimated")
        $("#sceneTransition").show()
        const colorArr: string[] = [];
        for(let i = 0; i<20; i++){
            colorArr.push(`rgba(0,0,0,1)`)
        }

        $("#sceneTransition").on('animationend', e => {
            $("#sceneTransition").css("background", `linear-gradient(to right top, ${colorArr.join(',')})`)
            let counter = 0;
            const disappear = setInterval(() => {
                if(counter >= 19){
                    clearInterval(disappear)
                    $("#sceneTransition").hide()
                }
                colorArr[counter] = colorArr[counter].replace('1', '0');
                $("#sceneTransition").css("background", `linear-gradient(to right top, ${colorArr.join(',')})`)
                counter++;
            }, 0)
        })
    }
    public static changeBackground(bgName: string): void {
        Player.sceneTraisitionEffect()
        $("#background").attr("src", `img/backgrounds/${bgName}.jpg`)
    }
    public static changeStage(stage: string): void {
        Player.Common.stage = stage;
        Player.changeBackground(stage)
    }
    public static onSocketMessage(): void {
        Player.ws.on("detectMob", (mob: {
            id: keyof typeof EnemyClasses;
            stage: string;
            level: string;
            hp: string;
            frame: string;
        }) => {
            Player.fightAlert()
            Player.spawnMob(mob)
        })
        Player.ws.on("upgradeResponse", (res: {
            data: any,
            id: string
        }) => {
            Player.alert(L.process('upgrade_success'))
            Player.Inventory[res.id] = res.data;
            Player.setState({itemUpdated: true})
            Player.registerItemTooltip(Player.Inventory)
            Player.renderStat()
            Player.renderItem()
            Player.setState({upgrading: false})
        })
    }
}
Player.Init(); //Entry 
