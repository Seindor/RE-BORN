import { Players } from "@rbxts/services";
import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { Dependency, Service } from "@flamework/core";
import { CreatePack } from "../Entities/Abilities/CreatePack";
import { AbilityAggregate } from "shared/Domain/Ability/Aggregates/AbilityAggregate";

const sharedScope = CompositionRootShared.createScope();

import { PackResult } from "../Entities/Abilities/CreatePack";
import { ServerAtomReplication } from "server/Application/ServerAtomReplication";

export class Server_SetupAbilities {
    public api = {
        eventBusAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI),
    };

    public currentPacks = [] as PackResult[];

    constructor(player: Player) {
        task.spawn(() => {
            let playerStringUserId = tostring(player.UserId);

            const atomReplication = Dependency<ServerAtomReplication>();

            while (!atomReplication.IsPlayerFullyReady(playerStringUserId)) {
                task.wait();
            }

            const playerData = atomReplication.GetPlayersDataAtom().Get(playerStringUserId)!;

            this.currentPacks.push(
                CreatePack(playerData.Equipment.Character.Name, playerStringUserId),
            );
            this.currentPacks.push(CreatePack("Default", playerStringUserId));
        });
    }
}
