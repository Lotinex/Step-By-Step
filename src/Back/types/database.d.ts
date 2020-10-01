declare namespace Database {
    interface Units {
        users: {
            id: string;
            inventory: string;
            level: number;
            money: number;
            stage: string;
        };
        session: {
            id: string;
            profile: string;
            createdAt: bigint;
        };
        mobs: {
            id: string;
            stage: string;
            level: number;
            hp: number;
            frame: number;
        };
        item: {

        };
    }
}