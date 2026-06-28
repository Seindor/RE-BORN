import { DataStoreDefinition } from "shared/Types/Database/DataStoreTypes";

import { PlayerData } from "shared/Types/Database/PlayerData";

export const PlayerDataTemplate: PlayerData = {
    version: 1,

    slots: [],

    account: {
        joinedAt: 0,

        redeemedCodes: {},

        receivedGroupReward: false,

        discordVerified: false,

        tester: false,
    },

    purchases: {
        gamepasses: [],

        products: {},
    },

    settings: {
        masterVolume: 1,
        musicVolume: 1,
        effectsVolume: 1,

        keybinds: {
            M1: {
                inputTypes: ["MouseButton1"],
            },

            M2: {
                inputTypes: ["MouseButton2"],
            },

            Critical: {
                inputTypes: ["R"],
            },

            Block: {
                inputTypes: ["F"],
            },

            Interact: {
                inputTypes: ["E"],
            },

            Dash: {
                inputTypes: ["Q"],
            },

            Run: {
                inputTypes: ["LeftShift"],
            },
        },
    },
};

export const PlayersDataDefinition: DataStoreDefinition<"PlayersData"> = {
    name: "PlayersData",
    storeName: "PlayersData",
    templateName: "PlayerData",
    template: PlayerDataTemplate,
};
