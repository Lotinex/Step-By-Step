type PurePoint = {
    x: number;
    y: number;
}
declare namespace Player {
    interface stat {
        atk: number;
        health: number;
        critical_chance: number;
        critical_damage: number;
        atk_speed: number;
        def: number;
        accuracy: number;
        luck: number;
        ignore_protection: number;
        multishot: number;
    }
    
    interface equip {
        [itemName: string]: any;
    }
}