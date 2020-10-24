import {Enemy} from './enemy';
import Util from './util';
import Player from '../pages/game';
import { Entity } from './graphic';

class Slime extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)

    }
    public async action(): Promise<void> {
        this.unpartAll()
        await Util.waitFor(1);
        const ball = new Entity('slime-ball', -200, -200);
        ball.setAnimatedTexture({
            template: 'effects/slime/slime-attack1',
            limit: 5,
            frameDelay: 200
        })
        ball.setSize(70, 70)
        this.setParts({ball})
        Util.createAnimationLoop(() => {
            ball.moveToPosition({
                x: 250,
                y: -50
            })
        })
        await Util.waitFor(2.5);
        const arm = new Entity('slime-arm', -200, -200);
        arm.setTexture('img/mobs/slime/slime-arm-0.png')
        arm.setSize(300, 300)
        arm.setState({
            x: 265,
            y: 40
        })
        this.setParts({arm})
        Util.createAnimationLoop(() => {
            arm.moveToPosition({
                x: arm.state.x,
                y: arm.state.y
            })
        })
        await Util.waitFor(0.5);
        arm.setAnimatedTexture({
            template: 'mobs/slime/slime-arm',
            frameDelay: 150,
            limit: 8
        })
        await Util.waitFor(1);
        arm.setTexture('img/mobs/slime/slime-arm-0.png')
        await this.loopFor(5, 0.1, counter => {
            let attackPoint: PurePoint = {x: 0, y: 0};
            switch(counter){
                case 0:
                    attackPoint = {x: 0, y: 100};
                    break;
                case 1:
                    attackPoint = {x: 1500, y: 200};
                    break;
                case 2:
                    attackPoint = {x: 0, y: 700};
                    break;
                case 3:
                    attackPoint = {x: 1500, y: 650};
                    break;
                case 4:
                    attackPoint = {x: 1500, y: 400};
                    break;
            }
            this.createProjectile({
                x: ball.x,
                y: ball.y,
                tx: attackPoint.x,
                ty: attackPoint.y,
                reqTime: 0.6,
                imgSrc: 'img/effects/slime/slime-attack.png',
                w: 70,
                h: 70
            })
        })
        this.unpart('ball')
        await Util.waitFor(2);
        await this.loopFor(10, 0.2, counter => {
            this.createProjectile({
                x: counter * 100,
                y: 0,
                tx: Player.CursorPosition.x,
                ty: Player.CursorPosition.y,
                reqTime: 1,
                imgSrc: 'img/effects/slime/slime-attack.png',
                w: 75,
                h: 75
            })
        })

        
        await Util.waitFor(3);
        this.action()
    }
}
class Erosion extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    public async action(): Promise<void> {
        this.unpartAll()
    }
}
export default {
    'slime': Slime,
    'erosion': Erosion
}

