import { ReplicatedAtomAggregate } from "shared/Domain/ReplicatedAtoms/Aggregates/ReplicatedAtomAggregate";
import { RegisterReplicator } from "shared/Domain/ReplicatedAtoms/Decorators/RegisterReplicator";

import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { SessionStatsState } from "shared/Types/Replicators/SessionStats";

const serverScope = CompositionRootServer.createScope();

const serverAtomAPI = serverScope.resolve(ServerRegistry.Singletons.API.ServerAtomAPI);

@RegisterReplicator()
export class SessionStatsReplicator extends ReplicatedAtomAggregate<SessionStatsState> {
    constructor() {
        super("SessionStats", {});
    }

    public InitActor(actorId: string) {
        this.SetState({
            ...this.GetState(),
            [actorId]: {
                Health: { Value: 100, MaxValue: 100 },
                Posture: { Value: 100, MaxValue: 100 },
            },
        });
    }

    public SyncHealth(id: string, health: number, maxHealth: number): void {
        print(`SyncHealth`);
        this.Set(`${id}/Health`, { Value: health, MaxValue: maxHealth } as any);
    }

    public SyncPosture(id: string, posture: number, maxPosture: number): void {
        this.Set(`${id}/Posture`, { Value: posture, MaxValue: maxPosture } as any);
    }

    public ClearActor(id: string): void {
        this.Remove(id);
    }
}
