import {GraphicDamageRenderer} from './graphic';
import DamageText from './damage';
import Util from './util';
import Player from '../pages/game';
import ActiveSkill from './skill';
import Projectile from './projectile';
import Entity from './entity';
export abstract class Enemy extends Entity {
    public hp: number;
    public targeted: boolean;
    public w?: number;
    public h?: number;
    private parted: boolean;
    protected projectileCounter: number;
    public parts: {[name: string]: Entity} = {};
    constructor(id: string, x: number, y: number, w: number, h: number){ // 리팩토링 다시하자 나중에 (인자 개수좀 쳐줄여라)
        super(id, x, y);
        this.w = w;
        this.h = h;
        this.hp = 0;
        this.targeted = false;
        this.projectileCounter = 0;
        this.parted = false;
    }
    public unpartAll(): void {
        this.parted = false;
        for(const name in this.parts){
            this.parts[name].remove()
        }
        this.parts = {};
    }
    public unpart(name: string): void {
        this.parts[name].remove()
        delete this.parts[name];
    }
    public setParts(partObject: {[name: string]: Entity}): void {
        for(const name in partObject){
            this.parts[name] = partObject[name];
        }
        for(const name in partObject){
            this.parts[name].setBase(this.x, this.y)
            Player.EnemyEffectRenderer.addEntity(this.parts[name])
        }
        this.parted = true;
    }
    public static wait(second: number): Promise<void> {
        return new Promise(rs => {
            setTimeout(rs, second * 1000)
        });
    }
    public setHp(value: number){
        this.hp = value;
    }
    public onClick(e: MouseEvent){
        this.targeted = !this.targeted;
        if(!this.targeted) Player.CurrentTarget = undefined;
    }
    public loopFor(number: number, sec: number, action: (counter: number) => void): Promise<void> {
        return new Promise(rs => {
            let counter = 0;
            const func = () => {
                if(counter == number){
                    clearInterval(interval);
                    rs();
                }
                action(counter)
                counter++;
            }
            const interval = setInterval(func, sec * 1000);
        })
    }
    /*
    public move(x: number, y: number): Promise<void> {
        return new Promise(rs => {
            this.x += x;
            this.y += y;
            rs()
        })
    }*/
    public damage(coord: PurePoint): void {
        const isCritical = Math.random() < ((Player.Stat?.critical_chance as number) / 100);
        const dmg = Player.Stat?.atk;
        if(isCritical){
            (dmg as number) *= (Player.Stat?.critical_damage as number)
        }
        Player.DamageRenderer.addDamage(new DamageText(dmg as number, coord, isCritical))
        Player.Common.currentEnemyHpbar?.addValue(-(dmg as number)) 
       // my.currentEnemyHpbar?.quake() 나중에 고쳐서 다시 활성화.
    }  
    /**
     * @override
     */
    public update(){
        if(this.targeted){
            Player.CurrentTarget = {
                id: this.id,
                x: this.x,
                y: this.y
            };
        }
        if(this.parted){
            for(const name in this.parts){
                this.parts[name].setBase(this.x, this.y)
            }
        }
    }
    public summon(entity: Entity): void {
        Player.EnemyEffectRenderer.addEntity(entity)
    }
    public createProjectile(options: {
        x: number;
        y: number;
        tx: number;
        ty: number;
        reqTime: number;
        imgSrc: string; //?
        w?: number;
        h?: number;
    }): void {
        const projectile = new Projectile(`${this.constructor.name}-projectile-${this.projectileCounter}`, options.x, options.y);
        projectile.setTexture(options.imgSrc)
        projectile.setRenderer(Player.EnemyEffectRenderer)
        projectile.w = options.w || 10;
        projectile.h = options.h || 10;
        Player.EnemyEffectRenderer.addEntity(projectile)
        projectile.moveTo(options.tx, options.ty, options.reqTime)
        this.projectileCounter++;
    }
    abstract async action(): Promise<void>;

}
