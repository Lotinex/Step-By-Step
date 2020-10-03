import {Entity, GraphicDamageRenderer} from './graphic';
import DamageText from './damage';
import Util from './util';
import {EnemyEffectRenderer} from '../game';
import ActiveSkill from './skill';
import {my} from '../game';

export class Projectile extends Entity {
    private fadeoutWait: number;
    constructor(id: string, x: number, y: number){
        super(id, x, y)
        this.fadeoutWait = 0;
        this.remove = this.remove.bind(this);
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
    public move(toX: number, toY: number, moveFrame: number): void {
        const diff = {
            x: toX - this.x,
            y: toY - this.y
        }
        let dx = 0;
        let dy = 0;

        const moveInterval = setInterval(() => {
            if(dx == diff.x && dy == diff.y){
                clearInterval(moveInterval)
                setTimeout(this.remove, this.fadeoutWait)
            }
            this.x += diff.x / moveFrame;
            this.y += diff.y / moveFrame;
            dx += diff.x / moveFrame;
            dy += diff.y / moveFrame;
        }, 10)
    }
}
export abstract class Enemy extends Entity {
    public hp: number;
    public targeted: boolean;
    public img?: HTMLImageElement;
    public w?: number;
    public h?: number;
    protected projectileCounter: number;
    constructor(id: string, x: number, y: number, w: number, h: number){ // 리팩토링 다시하자 나중에 (인자 개수좀 쳐줄여라)
        super(id, x, y);
        this.w = w;
        this.h = h;
        this.hp = 0;
        this.targeted = false;
        this.projectileCounter = 0;
    }
    public static wait(second: number): Promise<void> {
        return new Promise(rs => {
            setTimeout(rs, second * 1000)
        });
    }
    public setHp(value: number){
        this.hp = value;
    }
    public render(ctx: CanvasRenderingContext2D){
        ctx.drawImage(this.img as HTMLImageElement, this.x  - <number>this.w / 2, this.y - <number>this.h / 2, <number>this.w, <number>this.h)
    }
    public onClick(e: MouseEvent){
        this.targeted = !this.targeted;
        if(!this.targeted) my.currentTarget = undefined;
    }
    /**
     * @override
     */
    public update(){
        if(this.targeted){
            my.currentTarget = {
                id: this.id,
                x: this.x,
                y: this.y
            };
        }
    }
    public createVectorProjectile(options: {
        x: number;
        y: number;
        vectorX: number;
        vectorY: number;
        vectorValue: number;
        imgSrc?: string; //?
    }): void {
        const projectile = new Projectile(`${this.constructor.name}-projectile-${this.projectileCounter}`, options.x, options.y)
        projectile.setTexture('img/items/trace_of_the_void.png')
        EnemyEffectRenderer.addEntity(projectile)
        projectile.move(options.vectorX, options.vectorY, options.vectorValue)
        this.projectileCounter++;
    }
    abstract async action(): Promise<void>;

}
