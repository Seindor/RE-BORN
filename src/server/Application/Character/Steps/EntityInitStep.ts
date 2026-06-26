import type { BootstrapStep } from "shared/Domain/Bootstrapper/Types/BootstrapTypes";
import type { CharacterBootstrapContext } from "../CharacterBootstrapContext";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { InitSolvers } from "server/Implementation/Entities/Solvers";
import { StatusEffectsLog } from "server/Implementation/Handlers/StatusEffectsLog";

const sharedScope = CompositionRootShared.createScope();

const entitiesStorageAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI);
const animationsAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AnimationsAPI);
const hitboxAPI = sharedScope.resolve(SharedRegistry.Singletons.API.HitboxAPI);

export class EntityInitStep implements BootstrapStep<CharacterBootstrapContext> {
    public name = "EntityInitStep";
    public priority = 1;

    public execute(ctx: CharacterBootstrapContext) {
        entitiesStorageAPI.AddEntity(ctx.id, ctx.character);
        InitSolvers(ctx.id);
        new StatusEffectsLog(ctx.id);
        animationsAPI.RemoveActorAnimators(ctx.id);
        hitboxAPI.TrackModel(ctx.character);
    }
}
