import {Enemy} from './enemy';


class Slime extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    async action(): Promise<void> {
        await Enemy.wait(0.1);
        this.x += 1;
        this.action()
    }
}
export default {
    'slime': Slime
}

