import $ from 'jquery';

export default class Bossbar {
    public limit: number;
    public current: number;
    public quakeLevel: number;

    constructor(limit: number, quakeLevel= 40){
        this.limit = limit;
        this.current = limit;
        this.quakeLevel = quakeLevel;
    }
    quake(level= this.quakeLevel){
        const bar = $("#bossbar")
        if(level <= 30) return bar.css("margin-top", 30)
        bar.css("margin-top", level)
        setTimeout(() => {
            bar.css("margin-top", 30)
            setTimeout(() => {
               this.quake(level * 0.92)
            }, 50)
        }, 50)
    }
    setValue(value: number){
        this.current = value;
        const R = this.current * (100 / this.limit);
        
        setTimeout(() => {
            $("#bossbarDmg").animate({
                'width': R + "%"
            }, 700)
        }, 500)

        $("#bossbarGage").animate({
            'width': R + "%"
        }, 500)
        $("#bossbarHeal").animate({
            'width': R + "%"
        }, 300);
    }
    addValue(value: number){
        this.current = this.current + value;
        const R = this.current * (100 / this.limit);
        
        setTimeout(() => {
            $("#bossbarDmg").animate({
                'width': R + "%"
            }, 700)
        }, 500)

        $("#bossbarGage").animate({
            'width': R + "%"
        }, 500)
        $("#bossbarHeal").animate({
            'width': R + "%"
        }, 300)
    }
}