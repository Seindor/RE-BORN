import { DataStoreDefinition } from "shared/Types/Database/DataStoreTypes";
import { LimitedsData } from "../../../../Types/Database/LimitedsData";

export const LimitedsTemplate: LimitedsData = {
    items: {},
};

export const LimitedsDefinition: DataStoreDefinition<"Limiteds"> = {
    name: "Limiteds",
    storeName: "Limiteds",
    templateName: "LimitedsData",
    template: LimitedsTemplate,
};
