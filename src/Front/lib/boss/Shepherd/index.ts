import { Entity } from '../../graphic';
import Player from '../../../pages/game';
import Boss from '../boss';
import Util from '../../util'
import { Enemy } from '../../enemy';
export default class Shepherd extends Boss {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    public async action(): Promise<void> {
        this.unpartAll()
        await Util.waitFor(1);
        const sword = new Entity('shepherd-sword', -200, -200);
        sword.setAnimatedTexture({
            template: 'boss/shepherd/shepherd-sword',
            limit: 6,
            frameDelay: 200
        })
        sword.setSize(400, 400)
        sword.setState({
            x: -125,
            y: 20
        })
        sword.setAlpha(0)
        sword.rotate(-15)
        Util.createAnimationLoop(() => {
            sword.moveToPosition({
                x: sword.state.x,
                y: sword.state.y
            })
        })
        this.setParts({sword})
        Entity.fillTextBox('셰퍼드가 그의 검을 소환하기 위해 힘을 모읍니다.')
        await this.loopFor(20, 0.1, counter => {
            sword.setAlpha(sword.alpha + 0.05)
        });
        for(let i=0; i<10; i++){
            await this.smoothMove({
                x: Util.random(0, 1500),
                y: Util.random(200, 700),
                reqTime: 1,
                stopDistance: 20
            })
            await this.smoothMove({
                x: Util.random(0, 1500),
                y: Util.random(200, 700),
                reqTime: 1,
                stopDistance: 20
            })
        }
        this.action()
    }
}
