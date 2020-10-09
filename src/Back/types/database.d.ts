declare namespace Database {
    interface Units {
        users: {
            id: string;
            inventory: string;
            level: string;
            money: string;
            stage: string;
            stat: string;
            equip: string;
        };
        session: {
            id: string;
            profile: string;
            createdAt: bigint;
        };
        mobs: {
            id: string;
            stage: string;
            level: string;
            hp: string;
            frame: string;
        };
        item: {

        };
    }
}