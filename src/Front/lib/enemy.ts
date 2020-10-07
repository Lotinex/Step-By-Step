import {Entity, GraphicDamageRenderer} from './graphic';
import DamageText from './damage';
import Util from './util';
import {EnemyEffectRenderer, DamageRenderer} from '../game';
import ActiveSkill from './skill';
import {my} from '../game';
import Projectile from './projectile';
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
    public damage(coord: PurePoint): void {
        const dmg = Util.random(my.status?.atk as number, (my.status?.atk as number) * 2); //임시. 스탯 반영은 나중에
        DamageRenderer.addDamage(new DamageText(dmg as number, coord))
        my.currentEnemyHpbar?.addValue(-(dmg as number)) 
        my.currentEnemyHpbar?.quake()
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
        /*
        const projectile = new Projectile(`${this.constructor.name}-projectile-${this.projectileCounter}`, options.x, options.y)
        projectile.setTexture('img/items/trace_of_the_void.png')
        EnemyEffectRenderer.addEntity(projectile)
        projectile.move(options.vectorX, options.vectorY, options.vectorValue)
        this.projectileCounter++;*/
    }
    abstract async action(): Promise<void>;

}
