import { Default } from "./Default";
import { Sekiro } from "./Sekiro";
import { Dependency } from "@flamework/core";

export const VFXModules = {
    ["Sekiro"]: (): Sekiro => {
        return Dependency<Sekiro>();
    },
    ["Default"]: (): Default => {
        return Dependency<Default>();
    },
};
