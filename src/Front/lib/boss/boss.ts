import {Entity, GraphicRenderer} from '../graphic';
import Player from '../../pages/game';
import { Enemy } from '../enemy';

export default abstract class Boss extends Enemy {
    constructor(id: string, x: number, y: number, w: number, h: number){
        super(id, x, y, w, h)
    }
    public async once(): Promise<void> {}
    public async loopAction(): Promise<void> {}
    public async ready(): Promise<void> {}
    public playTheme(): void {
        const theme = new Audio();
        theme.src = `audio/theme/${this.id}/${this.id}-theme.mp3`;
        theme.loop = true;
        theme.play()
    }
}