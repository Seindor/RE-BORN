import { CreatePack, PackResult } from "../Entities/Abilities/CreatePack";
import { InitSolvers } from "../Entities/Solvers";
import { Server_CharacterHandler } from "./Server_CharacterHandler";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { CompositionRootServer } from "server/DI/CompositionRootServer";

let sharedScope = CompositionRootShared.createScope();
let serverScope = CompositionRootServer.createScope();

let statusEffectsAPI = serverScope.resolve(ServerRegistry.Singletons.API.StatusEffectsAPI);

export class Parrying_Dummy {
    constructor(npc: Model) {
        let abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);
        let statusEffectsAPI = serverScope.resolve(ServerRegistry.Singletons.API.StatusEffectsAPI);

        statusEffectsAPI.InitActor(npc.Name);
        InitSolvers(npc.Name);

        let Pack = CreatePack("Sekiro", npc.Name);

        new Server_CharacterHandler(npc, npc.Name, "Sekiro");

        statusEffectsAPI.CreateStatus(`Parry`, { duration: math.huge }, true, npc.Name);
    }
}
