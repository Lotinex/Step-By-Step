import { Entity } from '../../graphic';
import Player, {Tools} from '../../../pages/game';
import Boss from '../boss';
import Util, { AnimationFrame } from '../../util'
import { Enemy } from '../../enemy';
import $ from 'jquery';

export default class Shepherd extends Boss {
    private sword?: Entity;
    private swordMoveLoop?: AnimationFrame;
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
        this.setState({
            hasLoopAction: true,
            requireReady: true,
            loopAfterReady: true
        })
        this.playTheme()
    }
    public async loopAction(): Promise<void> {
        await this.smoothMove({
            x: Util.random(200, 1200),
            y: Util.random(300, 500),
            reqTime: 1
        })
        this.loopAction()
    }
    public async ready(): Promise<void> {
        this.unpartAll()
        await Util.waitFor(1);

        this.sword = new Entity('shepherd-sword', -200, -200);
        const sword = this.sword!;

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
        this.swordMoveLoop = Util.createAnimationLoop(() => {
            sword.moveToPosition({
                x: sword.state.x,
                y: sword.state.y
            })
        })
        this.setParts({
            sword: sword
        })
        await Entity.fillTextBox('셰퍼드가 「분산의 검」을 준비합니다.');
        await this.loopFor(20, 0.1, counter => {
            sword.setAlpha(sword.alpha + 0.05)
        });
    }
    public async action(): Promise<void> {
        const sword = this.sword!;

        await Util.waitFor(1.5);
        sword.setSize(400, 400)
        const blackFlame = new Entity('blackFlame', Util.random(100, 1400), 300);
        blackFlame.setSize(500, 1000)
        blackFlame.setAnimatedTexture({
            template: 'effects/shepherd/shepherd-blackFlame',
            frameDelay: 100,
            limit: 5
        })
        blackFlame.setAlpha(0)
        Player.EnemyEffectRenderer.addEntity(blackFlame)
        await Util.waitFor(0.3);
        await this.loopFor(10, 0.1, counter => {
            Tools.shake($(".renderer"), 20)
            blackFlame.setAlpha(blackFlame.alpha + 0.1)
        });
        await Util.waitFor(3);
        sword.setAlpha(0.3)
        await this.loopFor(40, 0, counter => {
            sword.setState({
                y: sword.state.y - 2
            })
            sword.setAlpha(sword.alpha + 0.035)
            sword.setSize(sword.w! + 5, sword.h! + 5)
        });
        const swordMoveX = Util.random(1, 2) == 1 ? 10 : 1400;
        this.swordMoveLoop!.stop()
        sword.smoothMove({
            x: swordMoveX,
            y: Util.random(100, 700),
            reqTime: 1
        })
        await sword.rotate(swordMoveX == 10 ? 90 : -90, 700)
        await Util.waitFor(0.7);
        const blackFlameRow = new Entity('blackFlame', 750, sword.y);
        blackFlameRow.setSize(500, 1600)
        blackFlameRow.rotate(swordMoveX == 10 ? -90 : 90)
        blackFlameRow.setAnimatedTexture({
            template: 'effects/shepherd/shepherd-blackFlame',
            frameDelay: 100,
            limit: 5
        })
        blackFlameRow.setAlpha(0)
        Player.EnemyEffectRenderer.addEntity(blackFlameRow)
        await Util.waitFor(0.3);
        await this.loopFor(10, 0.1, counter => {
            Tools.shake($(".renderer"), 20)
            blackFlameRow.setAlpha(blackFlameRow.alpha + 0.1)
        });
        await Util.waitFor(3.5);
        this.action() //required
    }
}
