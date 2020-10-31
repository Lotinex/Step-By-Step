import DamageText from './damage';
import $ from 'jquery';
import Util from './util';
import {Vector, GraphicRenderer} from './graphic';

export default class Entity {
    public id: string;
    public x: number;
    public y: number;
    public baseX: number;
    public baseY: number;
    public w?: number;
    public h?: number;
    public state: {[stateName: string]: any} = {};
    public img?: HTMLImageElement;
    private animateFrameDelay = 100;
    private rotation: number;
    public hitboxW: number = 0;
    public hitboxH: number = 0;
    private attackBoxPositions: {
        x1: number;
        x2: number;
        y1: number;
        y2: number;
    } = {
        x1: 0,
        x2: 0,
        y1: 0,
        y2: 0
    };
    public hasAttackbox: boolean = false;
    public hasHitbox: boolean = false;
    public alpha: number;
    public realtimeHitCheckTargets?: {
        [entityID: string]: {
            instance: Entity;
            action: (x: number, y: number) => void;
        }
    };
    private renderer?: GraphicRenderer;
    protected animatedTexture?: HTMLImageElement[];
    protected frameCountLimit?: number;
    protected frameCount?: number;
    /**@deprecated remove() 메서드의 구현으로 더 이상 사용되지 않음. */
    public alive: boolean; //렌더링에서 사라지고 싶을 때 false화 하자.
    public animated: boolean;
    private fixed: boolean;
    private lastTextureUpdate: number;
    public hitBox?: PureBox;
    public attackBox?: PureBox;
    constructor(id: string, x: number, y: number){
        this.id = id;
        this.x = x;
        this.y = y;
        this.alive = true;
        this.frameCount = 0;
        this.animated = false;
        this.lastTextureUpdate = 0;
        this.updateAnimatedTexture = this.updateAnimatedTexture.bind(this);
        this.baseX = 0;
        this.baseY = 0;
        this.fixed = false;
        this.rotation = 0;
        this.alpha = 1;
    }
    /**
     * 사라질 때 까지가 Promise의 resolve 시점이 아니라 나타날 때이다.
     *  */
    public static fillTextBox(value: string): Promise<void> {
        return new Promise(async rs => {
            $("#entityTextBox").css("opacity", "1")
            $("#entityTextBox").text(value)
            $("#entityTextBox").css("display", "flex")
            rs()
            await Util.waitFor(2);
            $("#entityTextBox").animate({
                opacity: "0"
            }, 1000, () => {
                $("#entityTextBox").hide()
            })
        })
    }
    public onMouseInHitbox?(): void;
    public setAlpha(alpha: number, reqTime = 0): void {
        let start: null | number = null;

        if(reqTime === 0){
            this.alpha = alpha;
            return;
        }
        const rotateAnimation = (time: number) => {
            if(!start){
                start = time;
            }
            const progress = time - start;
            if(progress >= reqTime) return;
            this.alpha = alpha * (progress / reqTime);
            requestAnimationFrame(rotateAnimation)
        }
        requestAnimationFrame(rotateAnimation)
    }
    public updateHitbox(): void {
        const xValue = this.hitboxW / 2;
        const yValue = this.hitboxH / 2;
        this.hitBox = {
            x1: this.x - xValue,
            x2: this.x + xValue,
            y1: this.y - yValue,
            y2: this.y + yValue
        };
    }
    public onHurt(entity: Entity): void {

    }
    public onHit(entity: Entity): void {

    }
    public smoothMove(options: {
        x: number;
        y: number;
        reqTime: number;
        stopDistance?: number;
    }): Promise<void> {
        return new Promise(rs => {
            const arvX = options.x;
            const arvY = options.y;
            const reqTime = options.reqTime;
            const stopDistance = options.stopDistance || 10;
            let lastProcess = 0;
            const motionUpdate = (time: number) => {
                const elapsedTime = time - lastProcess;
                lastProcess = time;
                const distance = Vector.distanceBetweenPoints({
                    x: this.x,
                    y: this.y
                }, {
                    x: arvX,
                    y: arvY 
                });
                if(distance <= stopDistance){
                    return rs();
                }
                const angle = Vector.angleBetweenPoints({
                    x: this.x,
                    y: this.y
                }, {
                    x: arvX,
                    y: arvY 
                });
                const velocity = distance / reqTime;
                const targetPointVector = new Vector(velocity, angle);
                const elapsedSec = elapsedTime / 1000;
                this.x += targetPointVector.x * elapsedSec;
                this.y += targetPointVector.y * elapsedSec;
    
                requestAnimationFrame(motionUpdate)
            }
            requestAnimationFrame((time: number) => {
                lastProcess = time;
                motionUpdate(time)
            })
        })
    }
    public setState(stateObject: {[stateName: string]: any}): void {
        for(const state in stateObject){
            const value = stateObject[state]!;
            this.state[state] = value;
        }
    }
    public setSize(width: number, height: number): void {
        this.w = width;
        this.h = height;
    }
    public rotate(degree: number, reqTime = 0): Promise<void> {
        return new Promise(rs => {
            let start: null | number = null;

            const radian = degree * Math.PI / 180;
            if(reqTime === 0){
                this.rotation = radian;
                return rs();
            }
    
            const rotateAnimation = (time: number) => {
                if(!start){
                    start = time;
                }
                const progress = time - start;
                if(progress >= reqTime) return rs();
                this.rotation = radian * (progress / reqTime)
                requestAnimationFrame(rotateAnimation)
            }
            requestAnimationFrame(rotateAnimation)
        })
    }
    public setRenderer(renderer: GraphicRenderer): void {
        this.renderer = renderer;
    }
    public setHitbox(): void {
        
    }
    public setPositionBasedHitbox(width: number, height: number): void {
        this.hasHitbox = true;
        this.hitboxW = width;
        this.hitboxH = height;
        const xValue = width / 2;
        const yValue = height / 2;

        this.hitBox = {
            x1: this.x - xValue,
            x2: this.x + xValue,
            y1: this.y - yValue,
            y2: this.y + yValue
        };
    }
    public updateAttackbox(): void {
        this.attackBox = this.attackBoxPositions;
    }
    public setAttackbox(box: PureBox): void {
        this.hasAttackbox = true;
        this.attackBox = box;
    }
    public setPositionBasedAttackbox(box: PureBox): void {
        this.hasAttackbox = true;
        this.attackBox = {
            x1: this.x + box.x1,
            x2: this.x + box.x2,
            y1: this.y + box.y1,
            y2: this.y + box.y2
        };
    }
    /**
     * 엔티티의 실제 x, y에 기반하여 엔티티가 차지하는 공간을 표현하는
     * 추상 범위 x1, x2, y1, y2를 반환한다.
     */
    public getAbstractEntityBox(): PureBox {
        const halfW = this.w! / 2;
        const halfH = this.h! / 2;
        return {
            x1: this.x - halfW,
            x2: this.x + halfW,
            y1: this.y - halfH,
            y2: this.y + halfH
        }
    }
    public onMouseInAttackbox(point: PurePoint): void {

    }
    public removeHitbox(): void {
        this.hasHitbox = false;
        this.hitboxW = 0;
        this.hitboxH = 0;
        this.hitBox = undefined;
    }
    public setBase(baseX: number, baseY: number): void {
        this.baseX = baseX;
        this.baseY = baseY;
    }
    public move(expression: Partial<PurePoint>): void {
        if(expression.x) this.x = this.baseX + this.x + expression.x;
        if(expression.y) this.y = this.baseY + this.y + expression.y;
    }
    public fix(expression: Partial<PurePoint>): void {
        this.fixed = true;
    }
    public moveToPosition(expression: Partial<PurePoint>): void {
        if(expression.x) this.x = this.baseX + expression.x;
        if(expression.y) this.y = this.baseY + expression.y;
    }
    public checkAttackboxOverlap(hitBox: PureBox): boolean {
        if(this.attackBox === undefined) return false;
        const $attackBox = this.attackBox!;
        return !($attackBox.x1 > hitBox.x2 || $attackBox.x2 < hitBox.x1 || $attackBox.y1 > hitBox.y2 || $attackBox.y2 > hitBox.y1);

    }
    public checkInAttackbox(point: PurePoint): boolean{
        const $attackBox = this.attackBox!;
        return Util.checkPointInArea(point, $attackBox);
    }
    public remove(): void {
        this.renderer!.removeEntity(this.id);
    }
    public cancelAnimatedTexture(): void {
        this.animated = false;
    }
    public setTexture(expression: {src: string; width?: number, height?: number} | string){
        this.cancelAnimatedTexture()
        if(typeof expression === 'object'){
            const texture = new Image();
            texture.src = expression.src; //필수
            if(expression.width) texture.width = expression.width; //필수는
            if(expression.height) texture.height = expression.height; //아니다.

            this.img = texture;
        } else if(typeof expression === 'string'){
            const texture = new Image();
            texture.src = expression;

            this.img = texture;
        }
    }
    public useRealtimeHitCheckFor(entity: Entity, action: (x: number, y: number) => void): void {
        this.realtimeHitCheckTargets = {};
        this.realtimeHitCheckTargets[entity.id] = {
            instance: entity,
            action
        };
    }
    /**
     * 이 메서드에서 제공하는 gif 재생을 활용하기 위해서
     * src 대신 특별한 규칙을 따르는 template 값이 요구된다.
     * gif 파일 대신 특정 폴더 안에 name-number(1->Infinity) 형식의 일반 파일이 여러개 요구된다.
     * 
     * @example
     * const entity = new TestClass(...); //TestClass extends Entity
     * entity.setAnimatedTexture({
     *  template: 'fire/fire',
     *  width: ...,
     *  height: ...,
     *  type: 'png',
     *  limit: 10
     * })
     * 
     */
    public setAnimatedTexture(expression: {
        limit: number;
        template: string;
        width?: number;
        height?: number;
        frameDelay?: number;
        type?: 'png' | 'jpg';
    }){ //성능에 다소 영향을
        if(expression.frameDelay) this.animateFrameDelay = expression.frameDelay;
        this.frameCountLimit = expression.limit - 1;
        const firstFrame = new Image();
        firstFrame.src = `img/${expression.template}-0.${expression.type || 'png'}`;
        this.img = firstFrame;
        this.animatedTexture = [];

        for(let i=0; i<expression.limit; i++) {
            const image = new Image();
            image.src = `img/${expression.template}-${i}.${expression.type || 'png'}`;
            this.animatedTexture.push(image)
        }

        this.animated = true;
        
        requestAnimationFrame(this.updateAnimatedTexture)
    }
    /**
     * 렌더링 중 연산을 최소화하기 위해 setanimatedTexture에서 
     * this.animatedTexture에 미리 Image 인스턴스를 넣어두는 작업을 한다.
     */
    public updateAnimatedTexture(time: number): void { //줄 수 있다.
        if(!this.animated) return;
        if((time - this.lastTextureUpdate) < this.animateFrameDelay) {
            return void requestAnimationFrame(this.updateAnimatedTexture)
        }
        this.lastTextureUpdate = time;

        this.img = (this.animatedTexture as HTMLImageElement[])[this.frameCount as number];
        if(this.frameCount == this.frameCountLimit){
            this.frameCount = 0;
        } else (this.frameCount as number)++;

        requestAnimationFrame(this.updateAnimatedTexture)

    }
    /**
     * override할때 rotation을 쉽게 적용할 수 있도록
     */
    private applyRotation(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.translate(-this.x, -this.y)
    }
    /**
     * override할때 alpha를 쉽게 적용할 수 있도록
     */
    private applyAlpha(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.alpha;
    }
    public update(time: number): void {};
    /**
     * 렌더링을 override 할 때 필수로 넣어야 할 것들을 위한 함수.
     * @param renderingFunc 렌더링에서 수행할 내용
     * @example
     * public render(ctx: CanvasRenderingContext2D): void {
     *  this.OverrideRendering(ctx => {
     *      ctx.drawImage(...)
     *  })
     * }
     */
    public OverrideRendering(renderingFunc: (ctx: CanvasRenderingContext2D) => void): void {
        const ctx = this.renderer!.ctx;
        ctx.save()
        this.applyRotation(ctx)
        this.applyAlpha(ctx)
        renderingFunc(ctx)
        ctx.restore()
    }
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save() //override 시
        this.applyRotation(ctx)
        this.applyAlpha(ctx)
        ctx.drawImage(this.img as HTMLImageElement, this.x  - <number>this.w / 2, this.y - <number>this.h / 2, <number>this.w, <number>this.h)
        ctx.restore() //빠져서는 안 된다.
    }
    public onClick(e: MouseEvent): void {}
   // abstract update(): void;
}