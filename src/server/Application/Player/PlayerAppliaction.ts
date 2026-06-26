import { Players } from "@rbxts/services";
import { Service, OnStart } from "@flamework/core";

import { DataHandler } from "server/Implementation/Handlers/DataHandler";
import { PlayerBootstrapContext } from "./PlayerBootstrapContext";

import { LoadDataStep } from "./Steps/LoadDataStep";
import { InitStatusEffectsStep } from "./Steps/InitStatusEffectsStep";
import { InitAbilitiesStep } from "./Steps/InitAbilitiesStep";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { ServerCharacterApplication } from "../Character/CharacterApplication";

const sharedScope = CompositionRootShared.createScope();

const bootstrapperAPI = sharedScope.resolve(SharedRegistry.Singletons.API.BootstrapperAPI);

@Service()
export class ServerPlayerApplication implements OnStart {
    private bootstrap = bootstrapperAPI.Create<PlayerBootstrapContext>("Player");

    public onStart(): void {
        this.bootstrap.Register(new LoadDataStep());
        this.bootstrap.Register(new InitStatusEffectsStep());
        this.bootstrap.Register(new InitAbilitiesStep());

        Players.PlayerAdded.Connect((player) => {
            const ctx = this.buildContext(player);
            this.bootstrap.Run(ctx);

            player.CharacterAdded.Connect((character: Model) => {
                ctx.characterHandler.Init(tostring(player.UserId), character);
            });
        });
    }

    private buildContext(player: Player): PlayerBootstrapContext {
        const id = tostring(player.UserId);

        return {
            player,
            id,

            dataHandler: new DataHandler(player),
            characterHandler: new ServerCharacterApplication(),
        };
    }
}
