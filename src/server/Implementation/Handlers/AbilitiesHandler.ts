import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";

let abilitiesList = {};

export function SetupAbilities(player: Player) {
    for (const [, abilityData] of pairs(abilitiesList)) {
        //ServerSignals.SetupAbility.fire(player, abilityData);
    }
}
