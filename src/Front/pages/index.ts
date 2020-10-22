import {GraphicRenderer, Entity} from '../lib/graphic';
import Util from '../lib/util'
import $ from 'jquery'
class Star extends Entity {
    private brightness: number = 1;
    private radius: number;
    constructor(id: string, x: number, y: number, radius: number){
        super(id, x, y)
        this.radius = radius;
    }
    /**@override */
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath()
        ctx.fillStyle = 'white';
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }
}
class Main {
    private static backgroundRenderer = new GraphicRenderer("background");
    private static starCount = 200;
    public static Init(): void {
        $("#background").attr("width", window.innerWidth).attr("height", window.innerHeight)
        for(let i=0; i<Main.starCount; i++){
            const star = new Star(`star-${i}`, Util.random(0, 1500), Util.random(0, 750), Util.random(1, 2));
            Main.backgroundRenderer.addEntity(star)
        }
    }
}
Main.Init() //entry
