import { Sekiro } from "./Sekiro";
import { Dash } from "./Dash";
import { Dependency } from "@flamework/core";

export const VFXModules = {
    ["Sekiro"]: (): Sekiro => {
        return Dependency<Sekiro>();
    },
    ["Default_Dash"]: (): Dash => {
        return Dependency<Dash>();
    },
};
