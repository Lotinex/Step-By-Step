import {Entity, Vector, GraphicRenderer} from './graphic';
import {my, StageRenderer} from '../game';

export default class Projectile extends Entity {

    protected fadeoutWait: number;
    protected reqTime: number;
    protected arvX: number;
    protected arvY: number;
    protected lastProcess: number;
    protected renderer?: GraphicRenderer;
    protected distance: number;
    protected smooth: boolean;

    constructor(id: string, x: number, y: number){
        super(id, x, y)
        this.fadeoutWait = 0;
        this.remove = this.remove.bind(this);
        this.motionUpdate = this.motionUpdate.bind(this);
        this.reqTime = 0;
        this.arvX = this.x;
        this.arvY = this.y;
        this.lastProcess = 0;
        this.distance = 0;
        this.smooth = false;
    }
    public set isSmooth(value: boolean){
        this.smooth = value;
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
    protected remove(): void {
        if(this.renderer === undefined) return console.error('Renderer not defined.') //투사체를 생성할 때 렌더러를 명시하지 않은 경우
        delete this.renderer.entities[this.id];
    }
    public setRenderer(target: GraphicRenderer): void {
        this.renderer = target;
    }
    public moveTo(x: number, y: number, reqTime: number): void {
        this.arvX = x;
        this.arvY = y;
        this.reqTime = reqTime;
        this.distance = Vector.distanceBetweenPoints({
            x: this.x,
            y: this.y
        }, {
            x: this.arvX,
            y: this.arvY 
        });
        requestAnimationFrame((time: number) => {
            this.lastProcess = time;
            this.motionUpdate(time)
        })
    }
    /**
     * Implement this when create instance
     */
    public crashAction(): void {}
    protected motionUpdate(time: number): void {
        const elapsedTime = time - this.lastProcess;
        this.lastProcess = time;
        let distance = this.distance;

        if(this.smooth) distance = Vector.distanceBetweenPoints({
            x: this.x,
            y: this.y
        }, {
            x: this.arvX,
            y: this.arvY 
        });

        if(distance <= 5){
            this.crashAction()
            return void setTimeout(this.remove, this.fadeoutWait);
        }

        const angle = Vector.angleBetweenPoints({
            x: this.x,
            y: this.y
        }, {
            x: this.arvX,
            y: this.arvY 
        });
        const velocity = distance / this.reqTime;
        const targetPointVector = new Vector(velocity, angle);
        const elapsedSec = elapsedTime / 1000;
        this.x += targetPointVector.x * elapsedSec;
        this.y += targetPointVector.y * elapsedSec;

        requestAnimationFrame(this.motionUpdate)
    }
}
export class PlayerAttackProjectile extends Projectile {
    constructor(id: string, x: number, y: number){
        super(id, x, y);
    }
    /**do not override OK? */
    public crashAction(): void {
        StageRenderer.entities[my.currentTarget?.id as string].damage({
            x: this.x,
            y: this.y
        })
    }
    /**@override */
    protected motionUpdate(time: number): void {
        const elapsedTime = time - this.lastProcess;
        this.lastProcess = time;
        const distance = Vector.distanceBetweenPoints({
            x: this.x,
            y: this.y
        }, {
            x: my.currentTarget?.x as number,
            y: my.currentTarget?.y as number 
        });
        if(distance <= 10){
            this.crashAction()
            return void setTimeout(this.remove, this.fadeoutWait);
        }

        const angle = Vector.angleBetweenPoints({
            x: this.x,
            y: this.y
        }, {
            x: my.currentTarget?.x as number,
            y: my.currentTarget?.y as number 
        });
        const velocity = this.distance / this.reqTime;
        const targetPointVector = new Vector(velocity, angle);
        const elapsedSec = elapsedTime / 1000;
        this.x += targetPointVector.x * elapsedSec;
        this.y += targetPointVector.y * elapsedSec;

        requestAnimationFrame(this.motionUpdate)
    }
}