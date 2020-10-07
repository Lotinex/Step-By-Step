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
    changeBarWidth(R: number): void {
        /*setTimeout(() => {
            $("#hpbarDmg").animate({
                'width': R + "%"
            }, 50)
        }, 200)

        $("#hpbarHeal").animate({
            'width': R + "%"
        }, 50);*/

        /*$("#hpbarGage").animate({
            'width': R + "%"
        }, 0)*/
        $("#hpbarDmg").css("width", `${R}%`)
        $("#hpbarHeal").css("width", `${R}%`)
        $("#hpbarGage").css("width", `${R}%`)
    }
    setValue(value: number){
        this.current = value;
        const R = this.current * (100 / this.limit);

        this.changeBarWidth(R)
    }
    addValue(value: number){
        this.current = this.current + value;
        const R = this.current * (100 / this.limit);
        
        this.changeBarWidth(R)
    }
}