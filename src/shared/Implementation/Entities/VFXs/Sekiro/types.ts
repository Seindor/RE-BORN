export type ISekiroVFXs = {
    ["M1"]: {
        ["1"]: Attachment;
        ["2"]: Attachment;
        ["3"]: Attachment;
        ["Smooth"]: Trail;
        ["wind"]: Trail;
    } & Folder;
} & Folder;

export type ISekiroModels = {
	["Models"]: {
		["Katana"]: {
			["SurfaceAppearance"]: SurfaceAppearance;
		} & MeshPart;
		["MortalBlade"]: {
			["SurfaceAppearance"]: SurfaceAppearance;
		} & MeshPart;
		["MortalSheath"]: {
			["SurfaceAppearance"]: SurfaceAppearance;
		} & MeshPart;
		["Prosthesis"]: {
			["LeftCharArm"]: {
				["Body"]: {
					["WeldConstraint"]: WeldConstraint;
				} & MeshPart;
				["WeldConstraint"]: WeldConstraint;
			} & MeshPart;
			["SurfaceAppearance"]: SurfaceAppearance;
		} & MeshPart;
		["Sheath"]: {
			["SurfaceAppearance"]: SurfaceAppearance;
		} & MeshPart;
	} & Folder;
	["Welds"]: {
		["Left Arm_Prothesis_Weld"]: Weld;
		["MortalSheath_MortalBlade_Weld"]: Weld;
		["RH_Katana_Weld"]: Weld;
		["RH_MortalBlade_Weld"]: Weld;
		["Sheath_Katana_Weld"]: Weld;
		["Torso_MortalSheath_Weld"]: Weld;
		["Torso_Sheath_Weld"]: Weld;
	} & Folder;
} & Folder;

export type ISekiroAnimations = {
    ["Combat"]: {
        ["Hits"]: {
            ["Block_Hit_1"]: Animation;
            ["Block_Hit_2"]: Animation;
            ["Block_Hit_3"]: Animation;
            ["Hit_1"]: Animation;
            ["Hit_2"]: Animation;
            ["Hit_3"]: Animation;
            ["Parried_1"]: Animation;
            ["Parried_2"]: Animation;
        } & Folder;
        ["Sheath_M1"]: {
            ["M1_1"]: Animation;
            ["M1_2"]: Animation;
            ["M1_3"]: Animation;
            ["M1_4"]: Animation;
        } & Folder;
        ["Unsheath_M1"]: {
            ["M1_1"]: Animation;
            ["M1_2"]: Animation;
            ["M1_3"]: Animation;
            ["M1_4"]: Animation;
        } & Folder;
    } & Folder;
    ["Dashes"]: {
        ["Sheath"]: {
            ["Dash_Back_Left"]: Animation;
            ["Dash_Back_Right"]: Animation;
            ["Dash_Forward_Left"]: Animation;
            ["Dash_Forward_Right"]: Animation;
            ["Dash_Left"]: Animation;
            ["Dash_Right"]: Animation;
        } & Folder;
        ["Unsheath"]: {
            ["Dash_Back_Left"]: Animation;
            ["Dash_Back_Right"]: Animation;
            ["Dash_Forward_Left"]: Animation;
            ["Dash_Forward_Right"]: Animation;
            ["Dash_Left"]: Animation;
            ["Dash_Right"]: Animation;
        } & Folder;
    } & Folder;
    ["Defense"]: {
        ["Block_Break"]: Animation;
        ["Block_Break_Idle"]: Animation;
        ["Block_Idle"]: Animation;
        ["Parry_1"]: Animation;
        ["Parry_2"]: Animation;
        ["Parry_3"]: Animation;
        ["Parry_Cast"]: Animation;
    } & Folder;
    ["Misc"]: {
        ["Katana_Sheathing"]: Animation;
    } & Folder;
    ["Movement"]: {
        ["Block"]: {
            ["Falling"]: Animation;
            ["Idle"]: Animation;
            ["Jump"]: Animation;
            ["Run"]: Animation;
            ["Walk"]: Animation;
        } & Folder;
        ["Sheath"]: {
            ["Falling"]: Animation;
            ["Idle"]: Animation;
            ["Jump"]: Animation;
            ["Run"]: Animation;
            ["Walk"]: Animation;
        } & Folder;
        ["Unsheath"]: {
            ["Falling"]: Animation;
            ["Idle"]: Animation;
            ["Jump"]: Animation;
            ["Run"]: Animation;
            ["Walk"]: Animation;
        } & Folder;
    } & Folder;
} & Folder;
