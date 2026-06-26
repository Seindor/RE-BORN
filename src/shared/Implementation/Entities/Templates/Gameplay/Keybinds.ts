import { IRuntimeBind } from "shared/Types/Database/Keybinds";

export const DefaultBinds: Record<string, IRuntimeBind> = {
    M1: {
        inputTypes: [Enum.UserInputType.MouseButton1],
    },

    M2: {
        inputTypes: [Enum.UserInputType.MouseButton2],
    },

    Critical: {
        inputTypes: [Enum.KeyCode.R],
    },

    Block: {
        inputTypes: [Enum.KeyCode.F],
    },

    Interact: {
        inputTypes: [Enum.KeyCode.E],
    },

    Dash: {
        inputTypes: [Enum.KeyCode.Q],
    },

    Run: {
        inputTypes: [Enum.KeyCode.LeftShift],
    },
};
