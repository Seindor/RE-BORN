import { ReplicatedAtomAggregate } from "shared/Domain/ReplicatedAtoms/Aggregates/ReplicatedAtomAggregate";
import { RegisterReplicator } from "shared/Domain/ReplicatedAtoms/Decorators/RegisterReplicator";

type SessionStatsState = Record<
    string,
    {
        Health?: { Hp: number; MaxHp: number };
        Posture?: { Posture: number; Max: number };
    }
>;

@RegisterReplicator()
export class SessionStatsReplicator extends ReplicatedAtomAggregate<SessionStatsState> {
    constructor() {
        super("SessionStats", "Public", {});
    }

    public SyncHealth(id: string, hp: number, maxHp: number): void {
        this.Set(`${id}/Health` as any, { Hp: hp, MaxHp: maxHp } as any);
    }

    public SyncPosture(id: string, posture: number, max: number): void {
        this.Set(`${id}/Posture` as any, { Posture: posture, Max: max } as any);
    }

    public ClearActor(id: string): void {
        this.Remove(id as any);
    }
}
