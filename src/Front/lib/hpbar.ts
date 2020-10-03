import $ from 'jquery';

export default class Hpbar {
    public limit: number;
    public current: number;
    public quakeLevel: number;
    public name: string;
    constructor(name: string,limit: number, quakeLevel= 40){
        this.name = name;
        this.limit = limit;
        this.current = limit;
        this.quakeLevel = quakeLevel;
        $('#hpbarName').text(this.name)
        $("#hpbar").show()
    }
    quake(level= this.quakeLevel){
        const bar = $("#hpbar")
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
            $("#hpbarDmg").animate({
                'width': R + "%"
            }, 700)
        }, 500)

        $("#hpbarGage").animate({
            'width': R + "%"
        }, 500)
        $("#hpbarHeal").animate({
            'width': R + "%"
        }, 300);
    }
    addValue(value: number){
        this.current = this.current + value;
        const R = this.current * (100 / this.limit);
        
        setTimeout(() => {
            $("#hpbarDmg").animate({
                'width': R + "%"
            }, 700)
        }, 500)

        $("#hpbarGage").animate({
            'width': R + "%"
        }, 500)
        $("#hpbarHeal").animate({
            'width': R + "%"
        }, 300)
    }
}