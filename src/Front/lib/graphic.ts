import DamageText from './damage';

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
    clear(){
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
    UpdateRequest(time: number){
        this.update()
        this.render(time)
        window.requestAnimationFrame(this.UpdateRequest)
    }
    update(){
        for(const id in this.entities){
            if(!this.entities[id].alive) delete this.entities[id];
        }
    }
    render(time: number){
        /**
         * 엔티티는 render 메서드를 필수로 구현해야 한다.
         * 모든 엔티티는 공통적으로 render 메서드가 호출되면서 화면에 그려지게 된다.
         */
        this.clear()
        for(const id in this.entities){
            this.entities[id].update(time)
            this.entities[id].render(this.ctx)
        }
    }
    /**
     * @deprecated
     */
    execute(id: string, action: (...args: any[]) => void){
        if(!this.entities.hasOwnProperty(id)) return;
        action(this.entities[id], this.entities[id].x, this.entities[id].y)
    }
    addEntity<K extends T>(entity: K){
        this.entities[entity.id] = entity;
        return entity;
    }
    removeEntity(id: string){
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

export abstract class Entity {
    public id: string;
    public x: number;
    public y: number;
    public w?: number;
    public h?: number;
    public img?: HTMLImageElement;
    protected animatedTexture?: Array<HTMLImageElement>;
    protected frameCountLimit?: number;
    protected frameCount?: number;
    public alive: boolean; //렌더링에서 사라지고 싶을 때 false화 하자.

    constructor(id: string, x: number, y: number){
        this.id = id;
        this.x = x;
        this.y = y;
        this.alive = true;
    }
    setTexture(expression: {src: string; width?: number, height?: number} | string){
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
    setAnimatedTexture(expression: {
        limit: number;
        template: string;
        width?: number;
        height?: number;
        type: 'png' | 'jpg';
    }){ //성능에 다소 영향을
        this.animatedTexture = [];

        for(let i=1; i<expression.limit + 1;) {
            const texture = new Image();
            texture.src = `assets/img/${expression.template}-${i}.${expression.type}`; //필수
            if(expression.width) texture.width = expression.width; //필수는
            if(expression.height) texture.height = expression.height; //아니다.

            this.animatedTexture.push(texture)
        }
        this.frameCount = 1;
        this.frameCountLimit = expression.limit;
    }
    /**
     * 렌더링 중 연산을 최소화하기 위해 setanimatedTexture에서 
     * this.animatedTexture에 미리 Image 인스턴스를 넣어두는 작업을 한다.
     */
    updateAnimatedTexture(){ //줄 수 있다.
        this.img = (this.animatedTexture as HTMLImageElement[])[this.frameCount as number];
        if(this.frameCount == this.frameCountLimit){
            this.frameCount = 1;
        } else (this.frameCount as number)++;
    }
    public update(time: number){}
    abstract render(ctx: CanvasRenderingContext2D): void;
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