
declare namespace PlayerData {
    interface Skills {
        [skillName: string]: ActiveSkill;
    };
    interface CursorPosition {
        x: number;
        y: number;
    };
    interface CurrentTarget {
        id: string;
        x: number;
        y: number;
        w?: number;
        h?: number;
    };
    interface Common {
        level: number;
        nickname: string;
        health: number;
        currentEnemyHpbar: Hpbar;
        currentTooltip: JQuery;
        projectileCounter: number;
        stage: string;
        money: number;
    }
    interface Stat {
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
    interface State {
        upgrading: boolean;
        itemUpdated: boolean;
    }
    interface Inventory {
        [itemName: string]: any;
    };
    interface Equip {
        [itemName: string]: any;
    }
}
type BossID = "shepherd";
type PurePoint = {
    x: number;
    y: number;
}
type hitBoxOverlapInfo = {
    subject: import('../lib/entity').default;
    target: import('../lib/entity').default;
};
type PureBox = {
    x1: number,
    x2: number;
    y1: number;
    y2: number;
};