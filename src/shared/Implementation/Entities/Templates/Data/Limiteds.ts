import { DataStoreDefinition } from "shared/Types/Gameplay/DataStoreTypes";
import { LimitedsData } from "../../../../Types/Gameplay/LimitedsData";

export const LimitedsTemplate: LimitedsData = {
    items: {},
};

export const LimitedsDefinition: DataStoreDefinition<"Limiteds"> = {
    name: "Limiteds",
    storeName: "Limiteds",
    templateName: "LimitedsData",
    template: LimitedsTemplate,
};
