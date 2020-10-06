import {Entity, Vector} from './graphic';

export default class Projectile extends Entity {

    private fadeoutWait: number;
    private reqTime: number;
    private arvX: number;
    private arvY: number;
    private lastProcess: number;

    constructor(id: string, x: number, y: number){
        super(id, x, y)
        this.fadeoutWait = 0;
        this.remove = this.remove.bind(this);
        this.motionUpdate = this.motionUpdate.bind(this);
        this.reqTime = 0;
        this.arvX = this.x;
        this.arvY = this.y;
        this.lastProcess = 0;
    }
    public setSize(w: number, h: number): void {
        this.w = w;
        this.h = h;
    }
    public setFadeoutWait(second: number): void {
        this.fadeoutWait = second * 1000;
    }
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.img as HTMLImageElement, this.x, this.y)
    }
    private remove(): void {
        this.alive = false;
    }
    public moveTo(x: number, y: number, reqTime: number): void {
        this.arvX = x;
        this.arvY = y;
        this.reqTime = reqTime;

        requestAnimationFrame(this.motionUpdate)
    }
    private motionUpdate(time: number): void {
        const elapsedTime = time - this.lastProcess;
        this.lastProcess = time;

        const distance = Vector.distanceBetweenPoints({
            x: this.x,
            y: this.y
        }, {
            x: this.arvX,
            y: this.arvY 
        });
        const angle = Vector.angleBetweenPoints({
            x: this.x,
            y: this.y
        }, {
            x: this.arvX,
            y: this.arvY 
        });
        console.log(angle)
        const velocity = distance / this.reqTime;
        const targetPointVector = new Vector(velocity, angle);
        const elapsedSec = elapsedTime / 1000;

        this.x += targetPointVector.x * elapsedSec;
        this.y += targetPointVector.y * elapsedSec;
        requestAnimationFrame(this.motionUpdate)
    }
}