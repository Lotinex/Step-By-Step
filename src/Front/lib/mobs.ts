import {Enemy} from './enemy';
import Util from './util';
import Player from '../pages/game';
import { Entity } from './graphic';

class Slime extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)

        const leftArm = new Entity('leftarm-slime', 0 , 0);
        leftArm.setTexture('img/effects/slime-attack-2.png')
        Player.EnemyEffectRenderer.addEntity(leftArm)
        leftArm.w = 100;
        leftArm.h = 100;
        this.setParts({
            leftArm
        })
        leftArm.moveToPosition({
            x: -200
        })
    }
    async action(): Promise<void> {
        await Enemy.wait(3);
        this.x += 100;
        let xCounter = 0;
        await this.loopFor(10, 0.2, () => {
            this.createProjectile({
                x: xCounter,
                y: 10,
                tx: Player.CursorPosition?.x as number + Util.random(-50, 50),
                ty: Player.CursorPosition?.y as number + Util.random(-50, 50),
                reqTime: 2.5,
                imgSrc: 'img/effects/slime-attack.png'
            })
            xCounter += 100;
        })
        await Enemy.wait(2);
        let effectCounter = 0;
        await this.loopFor(5, 0.5, () => {
            const x = Util.random(0, 1000);
            const y = Util.random(0, 1000);
            const attack = new Entity(`slime-attack-${effectCounter}`, x, y);
            attack.w = 500;
            attack.h = 500;
            attack.setTexture('img/effects/slime-attack-2.png')
            this.summon(attack)
            this.loopFor(35, 0, () => {
                attack.w! -= 10;
                attack.h! -= 10;
            })
            effectCounter++;
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

