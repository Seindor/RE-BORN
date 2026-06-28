import type { PipelineContext } from "shared/Domain/Pipeline/Aggregates/PipelineContext";
import { PlayerPipelineToken, type PlayerContext } from "../PlayerPipeline";
import { type SessionContext } from "shared/Types/Runtime/SessionRuntime";

import { DataHandler } from "server/Implementation/Handlers/DataHandler";
import type { RuntimeAPI } from "shared/Domain/Runtime/API/RuntimeAPI";
import type { ServerReplicatedAtomAPI } from "shared/Domain/ReplicatedAtoms/API/ServerReplicatedAtomAPI";
import type { PlayerDataReplicator } from "server/Implementation/Handlers/Replicators/PlayerDataReplicator";

import { Pipeline } from "shared/Domain/Pipeline/Decorators/Pipeline";

import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { PipelineStep } from "shared/Domain/Pipeline/Aggregates/PipelineStep";
import { SessionControllers } from "server/Implementation/Handlers/Runtimes/SessionRuntime/SessionControllers";
import { HealthControllerToken } from "server/Implementation/Handlers/Runtimes/SessionRuntime/SessionRuntimeTokens";

const sharedScope = CompositionRootShared.createScope();
const serverScope = CompositionRootServer.createScope();

const runtimeAPI = sharedScope.resolve(
    SharedRegistry.Singletons.API.RuntimeAPI,
) as RuntimeAPI<SessionContext>;

const serverReplicatedAtomAPI = serverScope.resolve(
    ServerRegistry.Singletons.API.ServerAtomAPI,
) as ServerReplicatedAtomAPI;

@Pipeline({ Pipeline: PlayerPipelineToken })
export class LoadDataStep extends PipelineStep<PlayerContext> {
    public readonly Id = "LoadDataStep";

    public Execute(ctx: PipelineContext<PlayerContext>): void {
        const { id, player } = ctx.Data;

        const handler = new DataHandler(player);
        if (!handler.Load()) error(`[LoadDataStep] Failed for ${id}`);

        // Сессия создаётся только после успешной загрузки данных
        const sessionRuntime = runtimeAPI.Create<SessionControllers>({ id }, "Session");
        sessionRuntime.SetMeta("DataHandler", handler);

        // Реплицируем дату игроку
        serverReplicatedAtomAPI
            .Get<PlayerDataReplicator>("PlayerData")
            ?.SetPlayerData(id, handler.GetData());

        // Гидрируем — клиент получает все атомы
        serverReplicatedAtomAPI.Hydrate(player);

        ctx.Log(`[LoadDataStep] Done for ${id}`);
    }
}
