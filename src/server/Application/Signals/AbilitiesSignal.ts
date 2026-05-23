import { OnStart, Service } from "@flamework/core";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";

let sharedScope = CompositionRootShared.createScope();

@Service()
export class AbilitiesSignal implements OnStart {
    onStart(): void {
        let abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);

        ServerSignals.Ability.connect(
            (
                player: Player,
                abilityName: string,
                method: "Start" | "End" | "Reject",
                ...args: unknown[]
            ) => {
                let playerStringUserId = tostring(player.UserId);

                let ability = abilityAPI.Get(playerStringUserId, abilityName);

                if (!ability) {
                    warn(`${abilityName} does not exist in ${playerStringUserId}`);
                    return;
                }

                if (method === "Reject") {
                    abilityAPI.Reject(ability, ...args);
                } else {
                    abilityAPI.Execute(ability, method, true, ...args);
                }
            },
        );
    }
}
