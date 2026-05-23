import { Dependency, Service, OnStart } from "@flamework/core";
import { ServerAtomReplication } from "./ServerAtomReplication";
import { ReplicatedStatus } from "shared/Types/GlobalStatusEffectsTypes";
import { StatusAggregate } from "shared/Domain/StatusEffects/Aggregates/StatusAggregate";

@Service()
export class StatusEffectsReplication {
    private replication = Dependency<ServerAtomReplication>();

    public Sync(actorId: string, statuses: StatusAggregate[]) {
        const replicated: ReplicatedStatus[] = statuses.map((s) => ({
            id: s.id,
            priority: s.priority,
            spawned: s.spawned,
            duration: s.duration,
            stacks: s.stacks,
            stackBehavior: s.stackBehavior,
            tags: s.tags,
            miscData: s.miscData,
        }));

        this.replication.statusEffectsAtom.Set(actorId, replicated);
    }

    public Clear(actorId: string) {
        this.replication.statusEffectsAtom.Remove(actorId);
    }
}
