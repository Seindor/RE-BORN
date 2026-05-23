import { Players } from "@rbxts/services";

import { Dependency } from "@flamework/core";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { ServerAtomReplication } from "server/Application/ServerAtomReplication";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";

let sharedScope = CompositionRootShared.createScope();

export class LoadAllEntitiesHandler {
    constructor(player: Player) {
        let entitiesStorageAPI = sharedScope.resolve(
            SharedRegistry.Singletons.API.EntitiesStorageAPI,
        );
        let entities = entitiesStorageAPI.GetEntities();

        for (const [name, entity] of entities) {
            if (Players.GetPlayerFromCharacter(entity.entity as Model)) {
                if (player.Character === entity.entity) continue;
                task.spawn(() => {
                    const atomReplication = Dependency<ServerAtomReplication>();

                    while (!atomReplication.IsPlayerFullyReady(name)) {
                        task.wait();
                    }

                    let entityPlayerData = atomReplication.GetPlayersDataAtom().Get(name);

                    if (entityPlayerData) {
                        ServerSignals.LaunchVFX.fire(
                            player,
                            entityPlayerData.Equipment.Character.Name,
                            "Spawn",
                            entity.entity,
                        );
                    }
                });
            } else {
                let character = entity.entity as Model;

                if (!character) continue;
                if (!character.GetAttribute("Character")) continue;

                ServerSignals.LaunchVFX.fire(
                    player,
                    character.GetAttribute("Character") as string,
                    "Spawn",
                    entity.entity,
                );
            }
        }
    }
}
