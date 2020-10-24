import DamageText from './damage';
import $ from 'jquery';
import Util from './util';
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

        window.requestAnimationFrame(this.UpdateRequest)
        canvas.addEventListener("click", e => {
            for(const id in this.entities){
                const entity = this.entities[id];
                const x = e.clientX - canvas.getBoundingClientRect().left
                const y = e.clientY - canvas.getBoundingClientRect().top
                const horizontalMinCheck = x >= (entity.x - (<number>entity.w / 2)); //최소 x값을 넘기는지
                const horizontalMaxCheck = x <= (entity.x + (<number>entity.w / 2)); //최대 x값을 안 넘기는지
                const verticalMinCheck = y >= (entity.y - (<number>entity.h / 2)); //최소 y값을 넘기는지
                const verticalMaxCheck = y <= (entity.y + (<number>entity.h / 2)); //최대 y값을 안 넘기는지
                if(horizontalMinCheck && horizontalMaxCheck && verticalMinCheck && verticalMaxCheck){
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
        this.update()
        this.render(time)
        window.requestAnimationFrame(this.UpdateRequest)
    }
    public update(){
        for(const id in this.entities){
            if(!this.entities[id].alive) delete this.entities[id];
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
            entity.update(time)
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
export class Entity {
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
    public alpha: number;
    private renderer?: GraphicRenderer;
    protected animatedTexture?: HTMLImageElement[];
    protected frameCountLimit?: number;
    protected frameCount?: number;
    /**@deprecated remove() 메서드의 구현으로 더 이상 사용되지 않음. */
    public alive: boolean; //렌더링에서 사라지고 싶을 때 false화 하자.
    public animated: boolean;
    private fixed: boolean;
    private lastTextureUpdate: number;
    public hitBox?: {
        x1: number;
        x2: number;
        y1: number;
        y2: number;
    };
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
            await Util.waitFor(1);
            $("#entityTextBox").animate({
                opacity: "0"
            }, 1000, () => {
                $("#entityTextBox").hide()
            })
        })
    }
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
    public rotate(degree: number, reqTime = 0): void {
        let start: null | number = null;

        const radian = degree * Math.PI / 180;
        if(reqTime === 0){
            this.rotation = radian;
            return;
        }

        const rotateAnimation = (time: number) => {
            if(!start){
                start = time;
            }
            const progress = time - start;
            if(progress >= reqTime) return;
            this.rotation = radian * (progress / reqTime)
            requestAnimationFrame(rotateAnimation)
        }
        requestAnimationFrame(rotateAnimation)
    }
    public setRenderer(renderer: GraphicRenderer): void {
        this.renderer = renderer;
    }
    public setHitbox(width: number, height: number): void {
        const xValue = width / 2;
        const yValue = height / 2;

        this.hitBox = {
            x1: this.x - xValue,
            x2: this.x + xValue,
            y1: this.y - yValue,
            y2: this.y + yValue
        };
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
    public checkHit(x: number, y: number){
        const $hitBox = this.hitBox!;

        if(
            x >= $hitBox.x1 &&
            x <= $hitBox.x2 &&
            y >= $hitBox.y1 &&
            y <= $hitBox.y2
        ) {
            return this.id;
        }
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
     * 오버라이딩할때 rotation을 쉽게 적용할 수 있도록
     */
    private applyRotation(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.translate(-this.x, -this.y)
    }
    /**
     * 오버라이딩할때 alpha를 쉽게 적용할 수 있도록
     */
    private applyAlpha(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.alpha;
    }
    public update(time: number){}
    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save() //오버라이딩 시
        this.applyRotation(ctx)
        this.applyAlpha(ctx)
        ctx.drawImage(this.img as HTMLImageElement, this.x  - <number>this.w / 2, this.y - <number>this.h / 2, <number>this.w, <number>this.h)
        ctx.restore() //빠져서는 안 된다.
    }
    public onClick(e: MouseEvent){}
   // abstract update(): void;
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

