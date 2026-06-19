import { AbilityPackDefinition } from "../CreatePack";
import { Dash } from "./Dash";
import { Run } from "./Run";

export const DefaultPack = {
    name: "Default",
    abilities: {
        ["Run"]: {
            key: "Run",
            priority: 1,
            abilityName: "Default_Run",
            activatingType: "Manual",
            type: "Hold",
            ability: Run,
        },
        ["Dash"]: {
            key: "Dash",
            priority: 1,
            abilityName: "Default_Dash",
            activatingType: "Manual",
            type: "Switch",
            ability: Dash,
        },
    },
} as AbilityPackDefinition;
