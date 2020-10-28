export default class Sound {
    private sound: HTMLAudioElement;
    constructor(resource: string, loop = false){
        this.sound = new Audio();
        this.sound.src = resource;
        this.sound.loop = loop;
    }
    public play(): Promise<void> {
        return this.sound.play();
    }
    public pause(): void {
        this.sound.pause()
    }
    public reStart(): Promise<void> {
        this.stop()
        return this.play()
    }
    public stop(): void {
        this.pause()
        this.sound.currentTime = 0;
    }
    public setVolume(value: number): void {
        this.sound.volume = value;
    }
}