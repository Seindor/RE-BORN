import { ReplicatedController } from "shared/Domain/Runtime/Components/ReplicatedController";
import type { SessionContext } from "shared/Types/Runtime/SessionRuntime";
import type { ServerReplicatedAtomAPI } from "shared/Domain/ReplicatedAtoms/API/ServerReplicatedAtomAPI";
import type { SessionStatsReplicator } from "server/Implementation/Handlers/Replicators/SessionStatsReplicator";

import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import type { DataHandler } from "server/Implementation/Handlers/DataHandler";

const serverScope = CompositionRootServer.createScope();
const serverReplicatedAtomAPI = serverScope.resolve(
    ServerRegistry.Singletons.API.ServerAtomAPI,
) as ServerReplicatedAtomAPI;

export class HealthController extends ReplicatedController<SessionContext> {
    public readonly Name = "HealthController";

    private Health = 100;
    private MaxHealth = 100;

    protected OnInit(): void {
        print(`Health Controller Initialized for ${this.runtime.Context.id}`);
        const dataHandler = this.runtime.GetMeta<DataHandler>("DataHandler");

        if (dataHandler) {
            const data = dataHandler.GetData();
            const slotData = data.slots[1];

            this.Health = slotData?.character.status.health ?? 100;
            this.MaxHealth = 100;
        } else {
            this.Health = this.runtime.GetMeta<number>("initialHealth") ?? 100;
            this.MaxHealth = this.runtime.GetMeta<number>("initialMaxHealth") ?? 100;
        }

        this.SyncToReplicator();
    }

    protected OnDestroy(): void {}

    public Damage(value: number): void {
        this.Health = math.clamp(value, 0, this.MaxHealth);
        this.SyncToReplicator();
    }

    public Heal(value: number): void {
        this.Health = math.clamp(this.Health + value, 0, this.MaxHealth);
        this.SyncToReplicator();
    }

    public GetHealth(): number {
        return this.Health;
    }
    public IsDead(): boolean {
        return this.Health <= 0;
    }

    protected Serialize() {
        return { Health: this.Health, MaxHealth: this.MaxHealth };
    }

    private SyncToReplicator(): void {
        serverReplicatedAtomAPI
            .Get<SessionStatsReplicator>("SessionStats")
            ?.SyncHealth(this.runtime.Context.id, this.Health, this.MaxHealth);
    }
}
