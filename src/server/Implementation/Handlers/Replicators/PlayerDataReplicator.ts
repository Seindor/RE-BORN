import { ReplicatedAtomAggregate } from "shared/Domain/ReplicatedAtoms/Aggregates/ReplicatedAtomAggregate";
import { RegisterReplicator } from "shared/Domain/ReplicatedAtoms/Decorators/RegisterReplicator";

import { PlayerData } from "shared/Types/Database/PlayerData";

type PlayerDataState = Record<string, PlayerData>;

@RegisterReplicator()
export class PlayerDataReplicator extends ReplicatedAtomAggregate<PlayerDataState> {
    constructor() {
        super("PlayerData", "Private", {});
    }

    public SetPlayerData(id: string, data: PlayerData): void {
        this.Set(id as any, data as any);
    }

    public ClearPlayerData(id: string): void {
        this.Remove(id as any);
    }
}
