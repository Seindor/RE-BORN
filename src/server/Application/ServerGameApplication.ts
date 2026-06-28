import { Workspace } from "@rbxts/services";

import { Dependency, OnStart, Service } from "@flamework/core";
import { AccessoryQualityFixHandler } from "server/Implementation/Handlers/AccessoryQualityFixHandler";
import { StepRunner } from "./StepRunner";

let NPCs = Workspace.WaitForChild("Map")!.WaitForChild("NPCs");

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import {
    GameContext,
    GamePipelineToken,
} from "server/Implementation/Handlers/Pipelines/Game/GamePipeline";

const sharedScope = CompositionRootShared.createScope();

const pipelineAPI = sharedScope.resolve(SharedRegistry.Singletons.API.PipelineAPI);

@Service()
export class ServerGameApplication implements OnStart {
    onStart(): void {
        new AccessoryQualityFixHandler();
        Dependency<StepRunner>();

        print(`Game Init Started.`);

        pipelineAPI.Run<GameContext>(GamePipelineToken, {
            id: `Game`,
        });
    }
}
