export interface ICharacterData {
    Name: string;
    Passive_1: string;
    Passive_2: string;
}

export interface PlayerData {
    Version: number;

    Currencies: {
        Souls: number;
        Kills: number;
    };

    Equipment: {
        Character: ICharacterData;
    };

    Inventory: {
        Passives: string[];
    };

    Config: {};

    Gamepasses: string[];

    Settings: {
        MusicVolume: number;
        EffectsVolume: number;
    };
}
