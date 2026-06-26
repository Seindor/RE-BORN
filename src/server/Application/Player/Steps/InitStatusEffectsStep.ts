import { BootstrapStep } from "shared/Domain/Bootstrapper/Types/BootstrapTypes";
import { PlayerBootstrapContext } from "../PlayerBootstrapContext";

import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { CompositionRootServer } from "server/DI/CompositionRootServer";

const serverScope = CompositionRootServer.createScope();

const statusEffectsAPI = serverScope.resolve(ServerRegistry.Singletons.API.StatusEffectsAPI);

export class InitStatusEffectsStep implements BootstrapStep<PlayerBootstrapContext> {
    public name = `InitStatusEffects`;
    public priority = 2;

    public execute(ctx: PlayerBootstrapContext) {
        statusEffectsAPI.InitActor(ctx.id);

        statusEffectsAPI.CreateStatus(
            "Loading",
            {
                duration: math.huge,
                priority: math.huge,
            },
            true,
            ctx.id,
        );
    }
}
