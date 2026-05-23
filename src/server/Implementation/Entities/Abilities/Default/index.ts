import { AbilityPackDefinition } from "../CreatePack";
import { Dash } from "./Dash";
import { Run } from "./Run";

export const DefaultPack = {
    name: "Default",
    abilities: {
        ["Run"]: {
            key: "Run",
            abilityName: "Default_Run",
            activatingType: "Manual",
            type: "Hold",
            ability: Run,
        },
        ["Dash"]: {
            key: "Dash",
            abilityName: "Default_Dash",
            activatingType: "Manual",
            type: "Hold",
            ability: Dash,
        },
    },
} as AbilityPackDefinition;
