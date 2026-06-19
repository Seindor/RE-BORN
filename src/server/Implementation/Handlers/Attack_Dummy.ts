import { CreatePack, PackResult } from "../Entities/Abilities/CreatePack";
import { InitSolvers } from "../Entities/Solvers";
import { Server_CharacterHandler } from "./Server_CharacterHandler";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { CompositionRootServer } from "server/DI/CompositionRootServer";

let sharedScope = CompositionRootShared.createScope();
let serverScope = CompositionRootServer.createScope();

export class Attack_Dummy {
    constructor(npc: Model) {
        let abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);
        let statusEffectsAPI = serverScope.resolve(ServerRegistry.Singletons.API.StatusEffectsAPI);

        statusEffectsAPI.InitActor(npc.Name);
        InitSolvers(npc.Name);

        new Server_CharacterHandler(npc, npc.Name, "Sekiro");

        let Pack = CreatePack("Sekiro", npc.Name);
        let M1 = Pack["M1"];

        task.spawn(() => {
            while (true) {
                abilityAPI.Execute(M1.ability!, "Start", true);
                task.wait(M1.ability!.config.cooldown / 3 ?? 0.5);
            }
        });
    }
}
