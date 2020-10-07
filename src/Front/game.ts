import SocketClient from './lib/socket';
import ActiveSkill from './lib/skill';
import XHR from './lib/xhr';
import {GraphicRenderer, GraphicDamageRenderer} from './lib/graphic';
import $ from 'jquery';
import EnemyClasses from './lib/mobs';
import {Enemy} from './lib/enemy';
import {PlayerAttackProjectile} from './lib/projectile';
import Hpbar from './lib/hpbar';

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
    status: {
        atk: number;
    };
    currentEnemyHpbar: Hpbar;
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
    my.status = { //임시방편. DB에 빨리 파고 불러오자.
        atk: 527292648
    }
    my.projectileCounter = 0;
    my.skills["detection"] = new ActiveSkill("detection", "p");
    my.skills["detection"].use = () => {
        ws.send("searchMob")
    };

    dragMap()
    drag($("#Inventory"))
    renderItem(my.inventory)


    $(".renderer").attr("width", window.innerWidth)
    $(".renderer").attr("height", window.innerHeight)

})
ws.on("detectMob", mob => {
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
        case 'Shift':
            attack()
            break;
    }
})
$(document).on("mousemove", e => {
    my.cursorPosition = {
        x: e.pageX,
        y: e.pageY
    }
})
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
function spawnMob(mob: {id: keyof typeof EnemyClasses, hp: string}){
    const newMob = new EnemyClasses[mob.id](mob.id, 300, 300, 300, 300);
    console.log(mob.hp)
    displayEnemyHpbar(mob.id, parseInt(mob.hp))
    newMob.setHp(parseInt(mob.hp))
    newMob.setTexture(`img/mobs/${mob.id}/${mob.id}-1.png`)
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
    projectile.setTexture('img/items/trace_of_the_void.png')
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
function drag(dialog: JQuery) {
    dialog.children(".dialog-head").on('mousedown', e => {
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
let tooltip = false;
function renderItem(itemObject: any){
    for(const item in itemObject){
        const itemData = itemObject[item];
        const itemBox = 
            $("<div>").addClass("item-box")
                .append($("<img>").addClass("item-img").attr("src", `img/items/${item}.png`))
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
            tooltip = true; //테스트
        }, e => {
            tooltip = false; //테스트
            $("#itemTooltip").hide();
        })
        $("#inventory-box").append(itemBox)
    }
}
$(window).on("mousemove", e => {
    if(tooltip){
        $("#itemTooltip").css("left", e.pageX + 20)
        $("#itemTooltip").css("top", e.pageY - 50)
    }
})
