const CONFIG = {
    STAR_LIMIT : 7
} //나중에 분리하자.
var my = {}; //내 정보 (스탯 등)

var testMobHp = 1000;
const ws = new Socket();
const bossBar = new Bossbar(10000);

const StageRenderer = new GraphicRenderer("stage");
const DamageRenderer = new GraphicDamageRenderer("damage-text");
const ObjectRenderer = new GraphicRenderer("objects");
const EnemyEffectRenderer = new GraphicRenderer("enemy-effect");
const MyEffectRenderer = new GraphicRenderer("my-effect");

ws.on('enter', data => { //여기서 초기화
    my = data;
    dragMap()
    drag($("#Inventory"))

   /** $.get(`/inventory?id=${my.id}`, res => { //테스트
        const items = JSON.parse(res);
        renderItem(items)
    })
    **/
    $("#stage").attr("width", window.innerWidth)
    $("#stage").attr("height", window.innerHeight)


    const testMob = new Enemy('test', 750, 350, 300, 200);
    testMob.setTexture('assets/img/image.png');
    StageRenderer.addEntity(testMob);

    let x;
    let y;
    document.addEventListener("mousemove", e => {
        x = e.pageX;
        y = e.pageY;
    })

   $(document).on("keydown", e => {
        if(e.key == "m"){
            if($("#map").css("display") == "none"){
                $("#map").show()
            } else $("#map").hide()
        }
    })
    $(".stage").on('click', e => {
        const stage = $(e.currentTarget).attr('id');
        XHR.POST('/stageChange', { stage }).then(res => {
            if(res.success) my.stage = stage;
            else console.error('Server response error')
        })
    })


})


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
                .append($("<img>").addClass("item-img").attr("src", `assets/img/${item}.png`))
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
            $("#itemTooltip-img").attr("src", `assets/img/${item}.png`) //이미지를 나중에 분류해놓자.
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
