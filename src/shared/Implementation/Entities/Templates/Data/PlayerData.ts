import { DataStoreDefinition } from "shared/Types/Gameplay/DataStoreTypes";
import { PlayerData } from "shared/Types/Gameplay/PlayerData";

export const PlayersDataTemplate: PlayerData = {
    Version: 1,

    Currencies: {
        Souls: 0,
        Kills: 0,
    },

    Equipment: {
        Character: {
            Name: "Sekiro",
            Passive_1: "none",
            Passive_2: "none",
        },
    },

    Inventory: {
        Passives: [],
    },

    Config: {},

    Gamepasses: [],

    Settings: {
        MusicVolume: 1,
        EffectsVolume: 1,
    },
};

export const PlayersDataDefinition: DataStoreDefinition<"PlayersData"> = {
    name: "PlayersData",
    storeName: "PlayersData",
    templateName: "PlayerData",
    template: PlayersDataTemplate,
};
