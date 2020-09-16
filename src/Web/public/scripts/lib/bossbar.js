class Bossbar {
    constructor(id, limit, quakeLevel= 40){
        this.id = id;
        this.element = $(`#${id}`);
        this.limit = limit;
        this.quakeLevel = quakeLevel;
    }
    quake(level= this.quakeLevel){
        const bar = this.element;
        if(level <= 30) return bar.css("margin-top", 30)
        bar.css("margin-top", level)
        setTimeout(() => {
            bar.css("margin-top", 30)
            setTimeout(() => {
               this.quake(level * 0.92)
            }, 50)
        }, 50)
    }
    setValue(value){
        const gage = this.element.children(".bossbarGage")
        const ratio =  gage.css("width") / this.limit;

        gage.css("width", value * ratio)
    }
    addValue(value){
        const gage = this.element.children(".bossbarGage")
        const ratio =  Number(gage.css("width").replace("px","")) / this.limit;

        gage.css("width", Number(gage.css("width").replace("px","")) + value * ratio)
    }
}