import Enemy from './enemy';


class Slime extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    async action(): Promise<void> { //재귀함수
        await Enemy.wait(1);
        this.createVectorProjectile({
            x: 400,
            y: 400,
            vectorX: 700,
            vectorY: 700,
            vectorValue: 30
        })
        this.action()
    }
}

export default {
    'slime': Slime
}

