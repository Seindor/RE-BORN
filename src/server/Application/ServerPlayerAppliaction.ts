import { Players } from "@rbxts/services";
import { Service, OnStart } from "@flamework/core";

import type { PipelineAPI } from "shared/Domain/Pipeline/API/PipelineAPI";
import type { RuntimeAPI } from "shared/Domain/Runtime/API/RuntimeAPI";
import type { ServerReplicatedAtomAPI } from "shared/Domain/ReplicatedAtoms/API/ServerReplicatedAtomAPI";
import type { SessionContext } from "shared/Types/Runtime/SessionRuntime";

import {
    PlayerPipelineToken,
    PlayerContext,
} from "server/Implementation/Handlers/Pipelines/Player/PlayerPipeline";

import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";

const sharedScope = CompositionRootShared.createScope();
const serverScope = CompositionRootServer.createScope();

const pipelineAPI = sharedScope.resolve(SharedRegistry.Singletons.API.PipelineAPI) as PipelineAPI;
const runtimeAPI = sharedScope.resolve(
    SharedRegistry.Singletons.API.RuntimeAPI,
) as RuntimeAPI<SessionContext>;

const serverReplicatedAtomAPI = serverScope.resolve(
    ServerRegistry.Singletons.API.ServerAtomAPI,
) as ServerReplicatedAtomAPI;

@Service()
export class ServerPlayerApplication implements OnStart {
    public onStart(): void {
        Players.PlayerAdded.Connect((player) => {
            pipelineAPI.Run<PlayerContext>(PlayerPipelineToken, {
                id: tostring(player.UserId),
                player,
            });
        });

        Players.PlayerRemoving.Connect((player) => {
            const id = tostring(player.UserId);
            runtimeAPI.Remove(id, "Session");
        });
    }
}
