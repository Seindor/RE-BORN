import { DefaultCombat } from "./Default";
import { SekiroCombat } from "./Sekiro";

const Combats = {
    Default: DefaultCombat,
    Sekiro: SekiroCombat,
};

export const SetupCombat = (ownerId: string, combatName: string) => {
    let combat = Combats[combatName as keyof typeof Combats];
    combat(ownerId);
};
