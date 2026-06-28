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

    private hp = 100;
    private maxHp = 100;

    protected OnInit(): void {
        print(`Health Controller Initialized for ${this.runtime.Context.id}`);
        const dataHandler = this.runtime.GetMeta<DataHandler>("DataHandler");

        if (dataHandler) {
            const data = dataHandler.GetData();
            const slotData = data.slots[1];

            this.hp = slotData?.character.status.health ?? 100;
            this.maxHp = 100;
        } else {
            this.hp = this.runtime.GetMeta<number>("initialHp") ?? 100;
            this.maxHp = this.runtime.GetMeta<number>("initialMaxHp") ?? 100;
        }

        this.SyncToReplicator();
    }

    protected OnDestroy(): void {}

    public Damage(v: number): void {
        this.hp = math.max(0, this.hp - v);
        this.SyncToReplicator();
    }

    public Heal(v: number): void {
        this.hp = math.min(this.maxHp, this.hp + v);
        this.SyncToReplicator();
    }

    public GetHp(): number {
        return this.hp;
    }
    public IsDead(): boolean {
        return this.hp <= 0;
    }

    protected Serialize() {
        return { Hp: this.hp, MaxHp: this.maxHp };
    }

    private SyncToReplicator(): void {
        serverReplicatedAtomAPI
            .Get<SessionStatsReplicator>("SessionStats")
            ?.SyncHealth(this.runtime.Context.id, this.hp, this.maxHp);
    }
}
