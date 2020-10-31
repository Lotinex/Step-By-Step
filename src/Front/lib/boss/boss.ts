import {GraphicRenderer} from '../graphic';
import Entity from '../entity';
import Player from '../../pages/game';
import { Enemy } from '../enemy';
import System from '../system';

export default abstract class Boss extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    public async once(): Promise<void> {};
    public async loopAction(): Promise<void> {};
    public async ready(): Promise<void> {};
}