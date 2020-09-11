class GraphicRenderer {
    constructor(canvas){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = canvas.getContext("2d");
        this.w = canvas.width;
        this.h = canvas.height;
        this.entities = {};

        window.requestAnimationFrame(this.UpdateRequest)
    }
    clear(){
        this.ctx.clearRect(0, 0, this.w, this.h)
    }
    UpdateRequest(){
        this.update()
        this.render()
        window.requestAnimationFrame(this.UpdateRequest)
    }
    update(){
        /**
         * Implement this
         */
    }
    render(){
        /**
         * 엔티티는 render 메서드를 필수로 구현해야 한다.
         * 모든 엔티티는 공통적으로 render 메서드가 호출되면서 화면에 그려지게 된다.
         */
        for(let id in this.entities){
            if(this.entities[id].hasOwnProperty('_animatedTexture')){
                this.entities[id].updateAnimatedTexture()
            }
            this.entities[id].render(this.ctx)
        }
    }
    execute(id, action){
        if(!this.entities.hasOwnProperty(id)) return;
        action(this.entities[id], this.entities[id].x, this.entities[id].y)
    }
}
/**
 * @abstract
 */
class Entity {
    constructor(id, x, y){
        this.id = id;
        this.x = x;
        this.y = y;
    }
    setTexture(expression){
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
    setAnimatedTexture(expression){ //성능에 다소 영향을
        this._animatedTexture = [];

        for(let i=1; i<expression.limit + 1;) {
            const texture = new Image();
            texture.src = `${expression.template}-${i}.${expression.type}`; //필수
            if(expression.width) texture.width = expression.width; //필수는
            if(expression.height) texture.height = expression.height; //아니다.

            this._animatedTexture.push(texture)
        }
        this._animatedCount = 1;
        this._animatedCountLimit = expression.limit;
    }
    /**
     * 렌더링 중 연산을 최소화하기 위해 set_animatedTexture에서 
     * this._animatedTexture에 미리 Image 인스턴스를 넣어두는 작업을 한다.
     */
    updateAnimatedTexture(){ //줄 수 있다.
        this.img = this._animatedTexture[this._animatedCount];
        if(this._animatedCount == this._animatedCountLimit){
            this._animatedCount = 1;
        } else this._animatedCount++;
    }
    /**
     * @abstract
     */
    render(){}
}