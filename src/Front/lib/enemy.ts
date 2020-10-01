import {Entity, GraphicDamageRenderer} from './graphic';
import DamageText from './damage';
import Util from './util';

declare var DamageRenderer: GraphicDamageRenderer;

export default class Enemy extends Entity {
    public hp: number;
    public targeted: boolean;
    public img?: HTMLImageElement;
    public w?: number;
    public h?: number;
    constructor(id: string, x: number, y: number, w: number, h: number, hp: number){ // 리팩토링 다시하자 나중에 (인자 개수좀 쳐줄여라)
        super(id, x, y);
        this.w = w;
        this.h = h;
        this.hp = hp;
        this.targeted = false;
    }
    render(ctx: CanvasRenderingContext2D){
        ctx.drawImage(this.img as HTMLImageElement, this.x  - <number>this.w / 2, this.y - <number>this.h / 2, <number>this.w, <number>this.h)
    }
    onClick(e: MouseEvent){
        this.targeted = !this.targeted;

        let damage = Util.random(0, 2)
        /*bossBar.quake();
        bossBar.addValue(-damage);*/
        DamageRenderer.addDamage(new DamageText(damage, e))
    }

}