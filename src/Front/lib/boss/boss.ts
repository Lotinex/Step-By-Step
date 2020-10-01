import {Entity, GraphicRenderer} from '../graphic';

declare var ObjectRenderer: GraphicRenderer;
declare var StageRenderer: GraphicRenderer;
declare var EnemyEffectRenderer: GraphicRenderer;
declare var MyEffectRenderer: GraphicRenderer;

class Unliving extends Entity {
    constructor(id: string, x: number, y: number){
        super(id, x, y)
    }
    remove(){
        ObjectRenderer.removeEntity(this.id)
    }
}
class Living extends Entity {
    constructor(id: string, x: number, y: number){
        super(id, x, y)
    }
    remove(){
        StageRenderer.removeEntity(this.id)
    }
}
class Effect extends Entity {
    public type: "enemy" | "my";

    constructor(id: string, type: "enemy" | "my", x: number, y: number){
        super(id, x, y)
        this.type = type;
    }
    remove(){
        if(this.type === "enemy"){
            EnemyEffectRenderer.removeEntity(this.id)
        } else if (this.type === "my"){
            MyEffectRenderer.removeEntity(this.id)
        }
    }
}
/**
 * @abstract
 */
class Boss extends Entity {
    public health: number;

    static TEXTURE_NUM_TABLE = {
        'Alycia' : 30
    }
    constructor(id: keyof typeof Boss.TEXTURE_NUM_TABLE, x: number, y: number, health: number){
        super(id, x, y)
        this.health = health;
    }
    /**
     * @abstract
     */
    action(){}
    /**
     * @abstract
     */
    render(){}
    /**
     * 살아있는(죽일 수 있는) 엔티티를 만든다.
     * @param {*} attributes 
     */
    createEntity(attributes: any){

    }
    /**
     * 무생물인(돌, 용암, 가시 등) 상호작용 가능한 엔티티를 만든다.
     * @param {*} attributes 
     */
    createObject(attributes: any){

    }
    /**
     * 무생물이면서 플레이어에게 데미지를 주거나 단순히 시각적 효과만 주는 엔티티를 만든다. (불, 전기, 토네이도 등)
     * @param {*} attributes 
     */
    createEffect(attributes: any){

    }
    spawn(){
        this.setAnimatedTexture({
            template: `boss/${this.id}/shape`,
            type: 'png',
            limit: (Boss.TEXTURE_NUM_TABLE as any)[this.id]
        })
    }
    die(){

    }

}