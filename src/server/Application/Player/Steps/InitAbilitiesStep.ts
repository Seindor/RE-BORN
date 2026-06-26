import { BootstrapStep } from "shared/Domain/Bootstrapper/Types/BootstrapTypes";
import { PlayerBootstrapContext } from "../PlayerBootstrapContext";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";

const sharedScope = CompositionRootShared.createScope();

const abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);

export class InitAbilitiesStep implements BootstrapStep<PlayerBootstrapContext> {
    public name = `InitAbilitiesStep`;
    public priority = 3;

    public execute(ctx: PlayerBootstrapContext) {
        abilityAPI.initActor(ctx.id);
    }
}
