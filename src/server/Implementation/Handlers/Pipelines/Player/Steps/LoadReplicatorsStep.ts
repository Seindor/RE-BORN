import type { PipelineContext } from "shared/Domain/Pipeline/Aggregates/PipelineContext";
import { PlayerPipelineToken, type PlayerContext } from "../PlayerPipeline";
import { type SessionContext } from "shared/Types/Runtime/SessionRuntime";

import { DataHandler } from "server/Implementation/Handlers/DataHandler";
import type { RuntimeAPI } from "shared/Domain/Runtime/API/RuntimeAPI";
import type { ServerReplicatedAtomAPI } from "shared/Domain/ReplicatedAtoms/API/ServerReplicatedAtomAPI";

import { Pipeline } from "shared/Domain/Pipeline/Decorators/Pipeline";

import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { PipelineStep } from "shared/Domain/Pipeline/Aggregates/PipelineStep";
import { SessionStatsReplicator } from "server/Implementation/Handlers/Replicators/SessionStatsReplicator";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";

const sharedScope = CompositionRootShared.createScope();
const serverScope = CompositionRootServer.createScope();

const runtimeAPI = sharedScope.resolve(
    SharedRegistry.Singletons.API.RuntimeAPI,
) as RuntimeAPI<SessionContext>;

const janitorAPI = sharedScope.resolve(SharedRegistry.Singletons.API.JanitorAPI);

const serverReplicatedAtomAPI = serverScope.resolve(
    ServerRegistry.Singletons.API.ServerAtomAPI,
) as ServerReplicatedAtomAPI;

@Pipeline({ Pipeline: PlayerPipelineToken })
export class LoadReplicatorsStep extends PipelineStep<PlayerContext> {
    public readonly Id = "LoadReplicatorsStep";
    public readonly After = ["LoadDataStep"];

    public Execute(ctx: PipelineContext<PlayerContext>): void {
        const { id, player } = ctx.Data;
        const janitor = janitorAPI.Create(id, `LoadreplicatorsStep`);

        let sessionStatsReplicator =
            serverReplicatedAtomAPI.Get<SessionStatsReplicator>("SessionStats");
        sessionStatsReplicator?.InitActor(id);
        serverReplicatedAtomAPI.AddRecipient("SessionStats", id, player);

        janitor.Add(
            ServerSignals.RequestHydrate.connect((player) => {
                print("HYDRATE REQUEST RECEIVED FROM", player);
                serverReplicatedAtomAPI.Hydrate(player);
            }),
            "Disconnect",
            `RequestHydrate`,
        );

        ctx.Log(`[LoadReplicatorsStep] Done for ${id}`);
    }
}
