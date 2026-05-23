import { UIButtonEffectsPrototypeKey, UIFrameEffectsPrototypeKey } from "../Prototypes/Effects";
import {
    GUIButtonCallbackType,
    GUIFrameCallbackType,
    UIButtonEffectEntry,
    UIFrameEffectEntry,
} from "./UIWrapperTypes";

type instanceType = Frame | TextLabel | ImageLabel | TextBox | GuiObject;

export interface IUIButtonAggregate {
    instance: GuiButton;
    miscData: Map<string, any>;
    effects: Map<
        string,
        {
            wrapper: IUIButtonAggregate;
            Emit(...args: any[]): void;
        }
    >;

    AddCallback(event: GUIButtonCallbackType, id: string, cb: Callback): void;
    RemoveCallback(event: GUIButtonCallbackType, id: string): void;
    RemoveAllCallbacks(): void;

    Fire(event: GUIButtonCallbackType, ...args: unknown[]): void;

    ApplyEffect(prototypes: UIButtonEffectsPrototypeKey[]): void;
    EmitEffect(entries: UIButtonEffectEntry[]): void;

    Destroy(): void;
}

export interface IUIFrameAggregate {
    instance: instanceType;
    miscData: Map<string, any>;
    effects: Map<
        string,
        {
            wrapper: IUIFrameAggregate;
            Emit(...args: any[]): void;
        }
    >;

    AddCallback(event: GUIFrameCallbackType, id: string, cb: Callback): void;
    RemoveCallback(event: GUIFrameCallbackType, id: string): void;
    RemoveAllCallbacks(): void;

    Fire(event: GUIFrameCallbackType, ...args: unknown[]): void;

    ApplyEffect(prototypes: UIFrameEffectsPrototypeKey[]): void;
    EmitEffect(entries: UIFrameEffectEntry[]): void;

    Destroy(): void;
}
