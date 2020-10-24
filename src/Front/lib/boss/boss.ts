import {Entity, GraphicRenderer} from '../graphic';
import Player from '../../pages/game';
import { Enemy } from '../enemy';

export default abstract class Boss extends Enemy {

    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }

}
