import {GraphicRenderer} from '../lib/graphic';
import Util from '../lib/util'
import $ from 'jquery'
import Entity from './entity';
export default class Star extends Entity {
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