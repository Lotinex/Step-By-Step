import {Entity, GraphicDamageRenderer} from './graphic';
import DamageText from './damage';
import Util from './util';
import {EnemyEffectRenderer} from '../game';

declare let DamageRenderer: GraphicDamageRenderer;

class Projectile extends Entity {
    constructor(id: string, x: number, y: number){
        super(id, x, y)
    }
    public setSize(w: number, h: number): void {
        this.w = w;
        this.h = h;
    }
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.drawImage(this.img as HTMLImageElement, this.x, this.y)
    }
    public move(toX: number, toY: number, moveFrame: number): void {
        const moveInterval = setInterval(() => {
            if(this.x == toX && this.y == toY) clearInterval(moveInterval);
            this.x += toX / moveFrame;
            this.y += toY / moveFrame;
        }, 10)
    }
}
export default abstract class Enemy extends Entity {
    public hp: number;
    public targeted: boolean;
    public img?: HTMLImageElement;
    public w?: number;
    public h?: number;
    constructor(id: string, x: number, y: number, w: number, h: number){ // 리팩토링 다시하자 나중에 (인자 개수좀 쳐줄여라)
        super(id, x, y);
        this.w = w;
        this.h = h;
        this.hp = 0;
        this.targeted = false;
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
    /**@deprecated */
    public onClick(e: MouseEvent){
        this.targeted = !this.targeted;

        const damage = Util.random(0, 2)
        /*bossBar.quake();
        bossBar.addValue(-damage);*/
        DamageRenderer.addDamage(new DamageText(damage, e))
    }
    public createVectorProjectile(options: {
        x: number;
        y: number;
        vectorX: number;
        vectorY: number;
        vectorValue: number;
    }): void {
        const projectile = new Projectile('test', options.x, options.y)
        projectile.setTexture('img/items/trace_of_the_void.png')
        EnemyEffectRenderer.addEntity(projectile)
        projectile.move(options.vectorX, options.vectorY, options.vectorValue)
    }
    abstract async action(): Promise<void>;

}
