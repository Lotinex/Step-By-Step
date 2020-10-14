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

export default class Player {
    public static CONFIG = {
        STAR_LIMIT : 7,
        test: 1
    };

    public static Inventory: PlayerData.Inventory = {};
    public static Common: Partial<PlayerData.Common> = {};
    public static Stat: Partial<PlayerData.Stat> = {};
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
        let key: keyof PlayerData.Stat;
        if($("#Stat").css("display") == "none"){
            Player.renderStat()
            $("#Stat").show()
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
    public static toggle(target: JQuery): JQuery<HTMLElement> {
        if(target.css("display") === "none"){
            target.show()
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
                Player.toggle($("#Inventory"))
                break;
            case 'Shift':
                Player.attack()
                break;
            case 'l':
                Player.showStat()
                break;
        }
    }
    public static renderItem(itemObject: any): void {
        for(const item in itemObject){
            const id = item;
            const itemData = itemObject[item];
    
            let equiped = (Player.Equip as PlayerData.Equip).hasOwnProperty(id);
    
            const itemBox = 
                $("<div>").addClass("item-box")
                    .append($("<img>").addClass("item-img").attr("src", `img/items/${item}.png`))
                    .attr("item", id)
                    .on('click', e => {
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
                    })
            if(equiped) itemBox.addClass("item-box-equiped");
    
            itemBox.hover(e => {
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
                $("#itemTooltip-name").html(`<span style="color:${itemNameColor};">${itemData.name}</span>`);
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
                            $("<div>").addClass("itemTooltip-stat-text").text(itemData.stat[stat])
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
            }, e => {
                Player.Common.currentTooltip = undefined; //테스트
                $("#itemTooltip").hide();
            })
            $("#inventory-box").append(itemBox)
        }
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
            
            Player.Skills["detection"] = new ActiveSkill("detection", "p");
            Player.Skills["detection"].use = () => {
                Player.ws.send("searchMob")
            };
        
            Player.dragMap()
            Player.drag()
            Player.renderItem(Player.Inventory)
        
        
            $(".renderer").attr("width", window.innerWidth)
            $(".renderer").attr("height", window.innerHeight)
            $("#profile-name").text(Player.Common.nickname as string)
            $("#profile-level").text(`Lv.${Player.Common.level as number}`)
        
            $("#profile-hpbarGage").css("width", `${Player.Common.health as number * (100 / Player.Stat!.health!)}%`)
        
            Player.updateMyHealth(40)
        
        })
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
        $(".stage").on('click', e => {
            const stage = $(e.currentTarget).attr('id');
            XHR.POST('/changeStage', { stage }).then(res => {
                if(res.success) Player.Common.stage = stage;
            }).catch(e => {
                console.error(e)
            })
        })
        $(".dialog-close").on("click", e => {
            $(e.currentTarget).parent().parent().hide()
        })
    }
}
Player.Init(); //Entry 
