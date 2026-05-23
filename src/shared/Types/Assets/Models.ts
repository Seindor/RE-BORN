export type IModels = {
    ["Sekiro"]: {
        ["Models"]: {
            ["Katana"]: MeshPart;
            ["Sheath"]: MeshPart;
        } & Folder;
        ["Welds"]: {
            ["RH_Katana_Weld"]: Weld;
            ["Sheath_Katana_Weld"]: Weld;
            ["Torso_Sheath_Weld"]: Weld;
        } & Folder;
    } & Folder;
} & Folder;
