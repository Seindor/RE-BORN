import { UserInputService } from "@rbxts/services";
import { ContextCallback, ContextProperties } from "../Types/ContextTypes";

export class ContextAggregate {
    public context: BoundActionInfo | {};
    public name: string;
    public bind: ContextCallback;
    public createTouchButton: boolean;
    public inputTypes: Array<Enum.KeyCode | Enum.UserInputType>;
    public priority?: number;
    public combo?: Array<Enum.KeyCode | Enum.UserInputType>;

    constructor(contextProperties: ContextProperties) {
        this.name = contextProperties.name;
        this.createTouchButton = contextProperties.createTouchButton;
        this.priority = contextProperties.priority;
        this.inputTypes = contextProperties.inputTypes;
        this.combo = contextProperties.combo;
        this.context = {};

        const originalBind = contextProperties.bind;

        if (contextProperties.combo && contextProperties.combo.size() > 0) {
            this.bind = (actionName, inputState, inputObject) => {
                if (inputState === Enum.UserInputState.Begin) {
                    const allHeld = this.combo!.every((key) =>
                        UserInputService.IsKeyDown(key as Enum.KeyCode),
                    );

                    if (!allHeld) {
                        return Enum.ContextActionResult.Pass;
                    }
                }

                return originalBind(actionName, inputState, inputObject);
            };
        } else {
            this.bind = originalBind;
        }
    }

    public OnSpawned() {}
    public OnRemoved() {}
}
