import {Enemy} from './enemy';
import Util from './util';
import {my} from '../game';

class Slime extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    async action(): Promise<void> {
        await Enemy.wait(3);
        await this.loopFor(50, 0, async () => {
            await this.move(0, -2)
        })
        let xCounter = 0;
        await this.loopFor(10, 0.2, () => {
            this.createProjectile({
                x: xCounter,
                y: 10,
                tx: my.cursorPosition?.x as number + Util.random(-50, 50),
                ty: my.cursorPosition?.y as number + Util.random(-50, 50),
                reqTime: 2.5,
                imgSrc: 'img/effects/slime-attack.png'
            })
            xCounter += 100;
        })
        await this.loopFor(50, 0, async () => {
            await this.move(0, 2)
        })
        this.action()
    }
}
class Erosion extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    async action(): Promise<void> {

    }
}
export default {
    'slime': Slime,
    'erosion': Erosion
}

