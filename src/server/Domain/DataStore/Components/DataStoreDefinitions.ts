import { PlayersDataDefinition } from "shared/Implementation/Entities/Templates/Data/PlayerData";
import { LimitedsDefinition } from "shared/Implementation/Entities/Templates/Data/Limiteds";

export const DataStoreDefinitions = {
    PlayersData: PlayersDataDefinition,
    Limiteds: LimitedsDefinition,
} as const;
