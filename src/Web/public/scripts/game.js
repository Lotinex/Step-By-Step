const CONFIG = {
    STAR_LIMIT : 7
} //나중에 분리하자.
var my = {}; //내 정보 (스탯 등)

const ws = new Socket();

const StageRenderer = new GraphicRenderer("stage");
const DamageRenderer = new GraphicDamageRenderer("damage-text");
const ObjectRenderer = new GraphicRenderer("objects");
const EnemyEffectRenderer = new GraphicRenderer("enemy-effect");
const MyEffectRenderer = new GraphicRenderer("my-effect");

ws.on('enter', data => { //여기서 초기화
    my = data;
    my.skills = {};

    my.skills["detection"] = new ActiveSkill("detection", "p");
    my.skills["detection"].use = () => {
        ws.send("searchMob")
    };

    dragMap()
    $("#Inventory").show()
    drag($("#Inventory"))
    renderItem(my.inventory)


    $(".renderer").attr("width", window.innerWidth)
    $(".renderer").attr("height", window.innerHeight)

})
ws.on("detectMob", mob => {
    console.log(mob) // test
})
$(".stage").on('click', e => {
    const stage = $(e.currentTarget).attr('id');
    XHR.POST('/changeStage', { stage }).then(res => {
        if(res.success) my.stage = stage;
    }).catch(e => {
        console.error(e)
    })
})
$(document).on("keydown", e => {
    switch(e.key){
        case 'm':
            if($("#map").css("display") === "none"){
                $("#map").show()
            } else $("#map").hide()
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
    }
})
function spawnMob(mob){
    const newMob = new Enemy(mob.id, 300, 300, 100, 100, parseInt(mob.hp));
    newMob.setAnimatedTexture({
        template: `mobs/${mob.id}`,
        type: 'png',
        limit: mob.frame
    })
    StageRenderer.addEntity(newMob)
}
function setSkillOnBox(targetBoxIndex, skillID){
    const skillBox = $("#skill").children[targetBoxIndex];
    skillBox.append($("<img>").addClass("skillBoxImage").attr("src", `assets/img/skills/${skillID}.png`))
}
function dragMap(){
    let position = { top: 0, left: 0, x: 0, y: 0 };

    const mouseDown = e => {
        position = {
            top: document.getElementById("map").scrollTop,
            left: document.getElementById("map").scrollLeft,
            x: e.pageX,
            y: e.pageY
        }
        $(document).on('mousemove', mouseMove)
        $(document).on('mouseup', mouseUp)
    }
    const mouseMove = e => {
        const dx = e.pageX - position.x;

        const dy = e.pageY - position.y;
        document.getElementById("map").scrollTop = position.top - dy
        document.getElementById("map").scrollLeft = position.left - dx
    }
    const mouseUp = e => {
        $(document).off('mousemove', mouseMove)
        $(document).off('mouseup', mouseUp)
    }

    $("#map").on('mousedown', mouseDown)

}
function drag(dialog) {
    dialog.children(".dialog-head").on('mousedown', e => {
      var offsetX = e.clientX - parseInt(dialog.css("left"))
      var offsetY = e.clientY - parseInt(dialog.css("top"))
      
      function mouseMoveHandler(e) {
        dialog.css("left", (e.clientX - offsetX))
        dialog.css("top", (e.clientY - offsetY))
      }
  
      function reset() {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', reset);
      }
  
      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', reset);
    });
}
let tooltip = false;
function renderItem(itemObject){
    for(let item in itemObject){
        const itemData = itemObject[item];
        const itemBox = 
            $("<div>").addClass("item-box")
                .append($("<img>").addClass("item-img").attr("src", `assets/img/items/${item}.png`))
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
            for(let stat in itemData.stat){
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
            $("#itemTooltip-img").attr("src", `assets/img/items/${item}.png`) //이미지를 나중에 분류해놓자.
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
