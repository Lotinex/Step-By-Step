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

const CONFIG = {
    STAR_LIMIT : 7,
    test: 1
}

export let my : Partial<{
    skills: {
        [skillName: string]: ActiveSkill
    };
    inventory: {
        [itemName: string]: any;
    };
    stage: string // fix me,
    currentTarget: {
        id: string;
        x: number;
        y: number;
        w?: number;
        h?: number;
    };
    cursorPosition: {
        x: number;
        y: number;
    };
    projectileCounter: number;
    stat: Player.stat;
    currentEnemyHpbar: Hpbar;
    currentTooltip: JQuery;
    equip: Player.equip;
}> = {

};
const ws = new SocketClient();

export const StageRenderer = new GraphicRenderer<Enemy>("stage");
export const DamageRenderer = new GraphicDamageRenderer("damage-text");
export const ObjectRenderer = new GraphicRenderer("objects");
export const EnemyEffectRenderer = new GraphicRenderer("enemy-effect");
export const MyEffectRenderer = new GraphicRenderer("my-effect");

ws.on('enter', data => { //여기서 초기화
    my = data;
    my.skills = {};
    my.projectileCounter = 0;
    console.log(my.equip)
    my.skills["detection"] = new ActiveSkill("detection", "p");
    my.skills["detection"].use = () => {
        ws.send("searchMob")
    };

    dragMap()
    drag()
    renderItem(my.inventory)


    $(".renderer").attr("width", window.innerWidth)
    $(".renderer").attr("height", window.innerHeight)

})
ws.on("detectMob", (mob: {
    id: keyof typeof EnemyClasses;
    stage: string;
    level: string;
    hp: string;
    frame: string;
}) => {
    fightAlert()
    spawnMob(mob)
})
$(".stage").on('click', e => {
    const stage = $(e.currentTarget).attr('id');
    XHR.POST('/changeStage', { stage }).then((res: {success: boolean}) => {
        if(res.success) my.stage = stage;
    }).catch(e => {
        console.error(e)
    })
})
$(".dialog-close").on("click", e => {
    $(e.currentTarget).parent().parent().hide()
})
$(document).on("keydown", e => {
    switch(e.key){
        case 'm':
            toggle($("#map"))
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
            toggle($("#Inventory"))
            break;
        case 'Shift':
            attack()
            break;
        case 'l':
            showStat()
            break;
    }
})
$(document).on("mousemove", e => {
    my.cursorPosition = {
        x: e.pageX,
        y: e.pageY
    }
})
function showStat(): void {
    let key: keyof Player.stat;
    if($("#Stat").css("display") == "none"){
        $("#statBox").empty()
        for(key in my.stat){
            const currentStatInfo = L.process(`statinfo_${key}`)
            $("#statBox").append(
                $("<div>").addClass("stat")
                    .append(
                        $("<div>").addClass("stat-title").text(L.process(`playerstat_${key}`))
                        .on('mouseenter', e => {
                            my.currentTooltip = $("#normalTextTooltip");
                            $("#normalTextTooltip").text(currentStatInfo)
                            $("#normalTextTooltip").show()
                        })
                        .on('mouseleave', e => {
                            my.currentTooltip = undefined;
                            $("#normalTextTooltip").empty()
                            $("#normalTextTooltip").hide()
                        })
                    )
                    .append(
                        $("<div>").addClass("stat-value").text((my.stat as Player.stat)[key] as number)
                    )
            )
        }
        $("#Stat").show()
    }
    else $("#Stat").hide()
}
function toggle(target: JQuery){
    if(target.css("display") === "none"){
        target.show()
    } else target.hide()
    return target;
}
function fightAlert(){
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
function spawnMob(mob: {
    id: keyof typeof EnemyClasses
    stage: string;
    level: string;
    hp: string;
    frame: string;
}){
    const newMob = new EnemyClasses[mob.id](mob.id, 700, 300, 450, 450);
    displayEnemyHpbar(mob.id, parseInt(mob.hp))
    newMob.setHp(parseInt(mob.hp))
    newMob.setAnimatedTexture({
        template: `mobs/${mob.id}/${mob.id}`,
        limit: parseInt(mob.frame)
    })
    newMob.action()
    StageRenderer.addEntity(newMob)
}/*
function setSkillOnBox(targetBoxIndex: number, skillID: string){
    const skillBox = $("#skill").children()[targetBoxIndex] as JQuery<HTMLElement>;
    skillBox.append($("<img>").addClass("skillBoxImage").attr("src", `assets/img/skills/${skillID}.png`))
}
*/
function displayEnemyHpbar(name: string, limit: number){
    my.currentEnemyHpbar = new Hpbar(name, limit);
}
function attack(){

    if(!my.currentTarget) return; //타겟팅이 어무것도 안 되어 있을 때
    const projectile = new PlayerAttackProjectile(`my-projectile-${my.projectileCounter}`, my.cursorPosition?.x as number, my.cursorPosition?.y as number);
    projectile.setSize(10, 10)
    projectile.setRenderer(MyEffectRenderer)
    projectile.isSmooth = true;
    projectile.setTexture({
        src: 'img/items/trace_of_the_void.png',
        width: 5,
        height: 5
    })
    MyEffectRenderer.addEntity(projectile)
    projectile.moveTo(my.currentTarget.x, my.currentTarget.y, 0.5);

    (my.projectileCounter as number)++;

}
function dragMap(){
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
function drag() {
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
    });
}
function renderItem(itemObject: any){
    for(const item in itemObject){
        const id = item;
        const itemData = itemObject[item];

        let equiped = (my.equip as Player.equip).hasOwnProperty(id);

        const itemBox = 
            $("<div>").addClass("item-box")
                .append($("<img>").addClass("item-img").attr("src", `img/items/${item}.png`))
                .attr("item", id)
                .on('click', e => {
                    if(equiped){
                        XHR.POST('/equipOffItem', {
                            item: id
                        }).then(res => {
                            if(res.success){
                                delete (my.equip as Player.equip)[id];
                                equiped = false;
                                itemBox.removeClass("item-box-equiped");
                            }
                        })
                    } else {
                        if(Object.keys(my.equip as Player.equip).length === 4) return alert("아이템은 4개까지 착용할 수 있습니다."); //나중에 다이얼로그 알림으로 고치자.
                        XHR.POST('/equipItem', {
                            item: id
                        }).then(res => {
                            if(res.success){
                                (my.equip as Player.equip)[id] = itemData;
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
            $("#itemTooltip-stat").html('');
            for(const stat in itemData.stat){
                $("#itemTooltip-stat").append(`${stat} ${itemData.stat[stat]}<br>`)
            }
            let star = '';
            for(let i=0; i<itemData.level.star; i++){ //별을 반 개씩 카운트하는건 아직 만들지 않았다.
                star += "★";
            }
            for(let i=0; i<CONFIG.STAR_LIMIT - itemData.level.star; i++){
                star += "☆";
            }

            $("#itemTooltip-star").text(star)
            $("#itemTooltip-img").attr("src", `img/items/${item}.png`) //이미지를 나중에 분류해놓자.
            $("#itemTooltip-description").text(itemData.description);
            $("#itemTooltip-abilities").text("잠겨 있습니다.") //구현할지 모른다.
            my.currentTooltip = $("#itemTooltip") //테스트
        }, e => {
            my.currentTooltip = undefined; //테스트
            $("#itemTooltip").hide();
        })
        $("#inventory-box").append(itemBox)
    }
}
$(window).on("mousemove", e => {
    if(my.currentTooltip){
        let dx = 0;
        let dy = 0;
        switch(my.currentTooltip.attr('id')){
            case "normalTextTooltip":
                dx = 20;
                dy = -15;
                break;
            case "itemTooltip":
                dx = 20;
                dy = -10;
                break;
        }
        my.currentTooltip.css("left", e.pageX + dx)
        my.currentTooltip.css("top", e.pageY + dy)
    }
})
