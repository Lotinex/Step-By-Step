import {Enemy} from './enemy';


class Slime extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    async action(): Promise<void> {
        /*
        await Enemy.wait(1);
        this.createVectorProjectile({
            x: 400,
            y: 400,
            vectorX: 300,
            vectorY: 300,
            vectorValue: 50
        })
        this.action()
        */
    }
}
export default {
    'slime': Slime
}

