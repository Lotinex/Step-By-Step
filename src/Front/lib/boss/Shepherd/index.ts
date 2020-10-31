import Entity from '../../entity';
import Player, {Tools} from '../../../pages/game';
import Boss from '../boss';
import Util, { AnimationFrame } from '../../util'
import { Enemy } from '../../enemy';
import $ from 'jquery';
import System from '../../system';

export default class Shepherd extends Boss {
    private sword?: Entity;
    private swordMoveLoop?: AnimationFrame;
    private blackBoltMoveLoop?: AnimationFrame;
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
        this.setState({
            hasLoopAction: true,
            requireReady: true,
            loopAfterReady: true
        })
        System.playSound('boss.shepherd')
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
        await Util.loopFor(20, 0.1, counter => {
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
        blackFlame.setAttackbox(blackFlame.getAbstractEntityBox())
        Player.EnemyEffectRenderer.addEntity(blackFlame)
        await Util.waitFor(0.3);
        await Util.loopFor(10, 0.1, counter => {
            Tools.shake($(".renderer"), 20)
            blackFlame.setAlpha(blackFlame.alpha + 0.1)
        });
        await Util.waitFor(3);
        sword.setAlpha(0.3)
        await Util.loopFor(40, 0, counter => {
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
        await Util.loopFor(10, 0.1, counter => {
            Tools.shake($(".renderer"), 20)
            blackFlameRow.setAlpha(blackFlameRow.alpha + 0.1)
        });
        await Util.waitFor(1.5);
        const blackBolt = new Entity('blackBolt', -300, -300);
        blackBolt.setAlpha(0.3)
        blackBolt.setAnimatedTexture({
            template: 'effects/shepherd/blackBolt',
            limit: 10,
            frameDelay: 170
        })
        blackBolt.setSize(500, 500)
        blackBolt.setState({
            x: 125,
            y: 50
        })
        this.blackBoltMoveLoop = Util.createAnimationLoop(() => {
            blackBolt.moveToPosition({
                x: blackBolt.state.x,
                y: blackBolt.state.y
            })
        })
        this.setParts({blackBolt})
        await Util.loopFor(10, 0.1, counter => {
            blackBolt.setAlpha(blackBolt.alpha + 0.1)
        });
        await Util.waitFor(2);
        await Util.loopFor(10, 0.1, counter => {
            const $counter = counter === 0 ? ++counter : counter;
            const blackBall = new Entity(`blackBall-${counter}`, blackBolt.x, blackBolt.y);
            blackBall.setAnimatedTexture({
                template: 'effects/shepherd/blackBall',
                limit: 6,
                frameDelay: 160
            })
            blackBall.setSize(50, 50)
            Player.EnemyEffectRenderer.addEntity(blackBall)
            Util.loopFor(20, 0.05, counter => {
                blackBall.setSize(blackBall.w! + 10, blackBall.h! + 10)
            })
            blackBall.smoothMove({
                x: Util.random(1, 2) == 1 ? 100: 1400,
                y: Util.random(1, 2) == 1 ? 50 : 740,
                reqTime: 0.7,
                stopDistance: 20
            })
        })
        this.unpart('blackBolt')
        await Util.waitFor(3);
        const theRune = new Entity('theRune', Util.random(200, 1300), Util.random(350, 650));
        theRune.setAnimatedTexture({
            template: 'effects/shepherd/theRune',
            frameDelay: 150,
            limit: 4
        })
        theRune.setAlpha(0)
        theRune.setSize(500, 500)
        Player.EnemyEffectRenderer.addEntity(theRune)
        theRune.smoothMove({
            x: theRune.x,
            y: theRune.y + 30,
            reqTime: 0.8
        })
        await Util.loopFor(10, 0.05, counter => {
            theRune.setAlpha(theRune.alpha + 0.1)
        })
        await Util.waitFor(3.5);
        this.action() //required
    }
}
