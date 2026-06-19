import { AbilityPackDefinition } from "../CreatePack";
import { Block } from "./Block";

import { M1 } from "./M1";
import { Parry } from "./Parry";

export const SekiroPack = {
    name: "Sekiro",
    abilities: {
        ["M1"]: {
            key: "M1",
            priority: 1,
            abilityName: "Sekiro_M1",
            activatingType: "Signal",
            type: "Switch",
            ability: M1,
        },
        ["Block"]: {
            key: "Block",
            priority: 1,
            abilityName: "Sekiro_Block",
            activatingType: "Signal",
            type: "Hold",
            ability: Block,
        },
        ["Parry"]: {
            key: "Block",
            priority: 2,
            abilityName: "Sekiro_Parry",
            activatingType: "Signal",
            type: "Switch",
            ability: Parry,
        },
    },
} as AbilityPackDefinition;
