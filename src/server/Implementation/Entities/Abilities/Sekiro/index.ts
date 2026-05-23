import { AbilityPackDefinition } from "../CreatePack";

import { M1 } from "./M1";

export const SekiroPack = {
    name: "Sekiro",
    abilities: {
        ["M1"]: {
            key: "M1",
            abilityName: "Sekiro_M1",
            activatingType: "Signal",
            type: "Hold",
            ability: M1,
        },
    },
} as AbilityPackDefinition;
