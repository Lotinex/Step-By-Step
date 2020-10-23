

export class AnimationFrame {
    private action: (time: number) => void;
    private shouldRun = true;
    constructor(action: (time: number) => void){
        this.action = action;
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop)
    }
    private loop(time: number): void {
        if(!this.shouldRun) return;
        this.action(time)
        requestAnimationFrame(this.loop)
    }
    public stop(): void {
        this.shouldRun = false;
    }
}
export default class Util {
    public static random(start: number, end: number){
        return Math.floor((Math.random() * (end-start+1)) + start)
    }
    public static createAnimationLoop(action: (time: number) => void): AnimationFrame {
        return new AnimationFrame(action);
    }
}