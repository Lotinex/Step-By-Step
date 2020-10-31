import DamageText from './damage';
import $ from 'jquery';
import Util from './util';
import Entity from './entity';
import Player from '../pages/game';
/**
 * deprecated: damage text rendering (=> GraphicDamageRenderer class)
 */
export class GraphicRenderer<T extends Entity = Entity> {
    public ctx: CanvasRenderingContext2D;
    public canvas: HTMLCanvasElement;
    public w: number;
    public h: number;
    public entities: {
        [entityID: string]: T;
    }
    constructor(canvasID: string){
        const canvas = document.getElementById(canvasID) as HTMLCanvasElement;

        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.canvas = canvas;
        this.w = canvas.width;
        this.h = canvas.height;
        this.entities = {};
        this.UpdateRequest = this.UpdateRequest.bind(this);

        requestAnimationFrame(this.UpdateRequest)
        canvas.addEventListener("click", e => {
            for(const id in this.entities){
                const entity = this.entities[id];
                const x = e.clientX - canvas.getBoundingClientRect().left
                const y = e.clientY - canvas.getBoundingClientRect().top
                if(Util.checkPointInArea({x, y}, {
                    x1: entity.x - entity.w! / 2,
                    x2: entity.x + entity.w! / 2,
                    y1: entity.y - entity.h! / 2,
                    y2: entity.y + entity.h! / 2
                })){
                    entity.onClick(e)
                }
            }
        })
    }
    /**
     * 최적화를 위해 변경된 부분만 지우는 작업이 필요할 듯 하다.
     */
    public clear(){
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
    public UpdateRequest(time: number){
        this.update(time)
        this.render(time)
        window.requestAnimationFrame(this.UpdateRequest)
    }
    public update(time: number){
        for(const id in this.entities){
            const entity = this.entities[id];
            if(entity.hasHitbox) entity.updateHitbox()
            
            if(entity.hasAttackbox){
                const cursorPosition = {
                    x: Player.CursorPosition.x,
                    y: Player.CursorPosition.y
                };
                if(entity.checkInAttackbox(cursorPosition)){
                    entity.onMouseInAttackbox(cursorPosition)
                    Player.onHurt(entity)
                }
                for(const id in this.entities){
                    const checkTarget = this.entities[id];
                    if(checkTarget.hasHitbox){
                        if(entity.checkAttackboxOverlap(checkTarget.hitBox!)){
                            entity.onHit(checkTarget)
                            checkTarget.onHurt(entity)
                        }
                    }
                }
            }
            entity.update(time)
        }
    }
    public render(time: number){
        /**
         * 엔티티는 render 메서드를 필수로 구현해야 한다.
         * 모든 엔티티는 공통적으로 render 메서드가 호출되면서 화면에 그려지게 된다.
         */
        this.clear()
        for(const id in this.entities){
            const entity = this.entities[id];
            entity.render(this.ctx)
        }
    }
    /**
     * @deprecated
     */
    public execute(id: string, action: (...args: any[]) => void){
        if(!this.entities.hasOwnProperty(id)) return;
        action(this.entities[id], this.entities[id].x, this.entities[id].y)
    }
    public addEntity<K extends T>(entity: K): K {
        this.entities[entity.id] = entity;
        this.entities[entity.id].setRenderer(this);
        return entity;
    }
    public removeEntity(id: string){
        delete this.entities[id];
    }
}
/**
 * 데미지 텍스트는 인스턴스 구조상 일반 엔티티와 렌더링 시 방식이 달라
 * 별개의 서브클래스를 사용한다.
 */
export class GraphicDamageRenderer extends GraphicRenderer {
    public damages: DamageText[];

    constructor(canvas: string){
        super(canvas)
        this.damages = [];
    }
    /**
     * @override
     */
    render(){
        this.clear()
        for(const damage of this.damages){
            damage.render(this.ctx)
        }
    }
    /**
     * @override
     */
    update(){
        for(const damage of this.damages){
            if(damage.life <= 0){
                damage.startDying = true;
                continue;
            }
            damage.life--;
            for(const text of damage.data){
                text.y--;
            }
        }
    }
    addDamage(damage: DamageText){
        this.damages.push(damage)
    }
}
/**
 * @deprecated 일단 사용 안 됨
 */
class EntityController {
    public renderer: GraphicRenderer;
    public id: string;
    constructor(renderer: GraphicRenderer, id: string){
        this.renderer = renderer;
        this.id = id;
    }
    public kill(): void {
        this.renderer.removeEntity(this.id)
    }
}

export class Vector {
    public x: number;
    public y: number;
    public static distanceBetweenPoints(firstPoint: PurePoint, secondPoint: PurePoint){
        const lowerBase = secondPoint.x - firstPoint.x;
        const height = secondPoint.y - firstPoint.y;

        return Math.sqrt(lowerBase * lowerBase + height * height);
    }
    public static angleBetweenPoints(firstPoint: PurePoint, secondPoint: PurePoint){
        const lowerBase = secondPoint.x - firstPoint.x;
        const height = secondPoint.y - firstPoint.y;
        return Math.atan2(height, lowerBase) * 180 / Math.PI;
    }
    constructor(value: number, angle: number){
        const radian = (angle * Math.PI) / 180;
        this.x = value * Math.cos(radian);
        this.y = value * Math.sin(radian);
    }
}
