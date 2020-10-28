import Sound from './sound';

export default class System {
    public static soundResources = {
        'boss.shepherd': new Sound('audio/theme/shepherd')
    };
    public static playSound<K extends keyof typeof System.soundResources>(soundPath: K): Promise<void> {
        return System.soundResources[soundPath].play()
    }
    public static pauseSound<K extends keyof typeof System.soundResources>(soundPath: K): void {
        System.soundResources[soundPath].pause()
    }
    public static stopSound<K extends keyof typeof System.soundResources>(soundPath: K): void {
        System.soundResources[soundPath].stop()
    }
    public static restartSound<K extends keyof typeof System.soundResources>(soundPath: K): Promise<void> {
        return System.soundResources[soundPath].reStart()
    }
    public static setVolume<K extends keyof typeof System.soundResources>(soundPath: K, value: number): void {
        System.soundResources[soundPath].setVolume(value)
    }
    public static stopAll(): void {
        let sound: keyof typeof System.soundResources;
        for(sound in System.soundResources){
            System.soundResources[sound].stop()
        }
    }
}
