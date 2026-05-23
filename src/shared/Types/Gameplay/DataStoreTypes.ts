import type { PlayerData } from "shared/Types/Gameplay/PlayerData";
import type { LimitedsData } from "./LimitedsData";

export interface DataStoreDataMap {
    PlayersData: PlayerData;
    Limiteds: LimitedsData;
}

export interface DataTemplateMap {
    PlayerData: PlayerData;
    LimitedsData: LimitedsData;
}

export type DataStoreName = keyof DataStoreDataMap;
export type DataTemplateName = keyof DataTemplateMap;

export type ProfileKey = string;

export type DataStoreData<TStoreName extends DataStoreName> = DataStoreDataMap[TStoreName];

export type DataTemplateData<TTemplateName extends DataTemplateName> =
    DataTemplateMap[TTemplateName];

export type AnyDataStoreData = DataStoreDataMap[DataStoreName];

export interface DataStoreDefinition<TStoreName extends DataStoreName> {
    name: TStoreName;
    storeName: string;
    templateName: DataTemplateName;
    template: DataStoreDataMap[TStoreName];
}

export interface LoadProfileOptions {
    cancel?: () => boolean;
    userId?: number;
    onSessionEnd?: () => void;
}

export interface DataStorePayload<TStoreName extends DataStoreName = DataStoreName> {
    storeName: TStoreName;
    profileKey: ProfileKey;
    data: DataStoreDataMap[TStoreName];
}
