import { CurrencyPopupEffect } from "./Frame/CurrencyPopupEffect";
import { ScaleOnEnter } from "./Button/ScaleOnEnter";
import { ScaleOnActivate2 } from "./Frame/ScaleOnActivate2";
import { SpringEffect as SpringEffectFrame } from "./Frame/SpringEffect";
import { SpringEffect as SpringEffectButton } from "./Button/SpringEffect";

export const UIButtonEffectsPrototypes = {
    ["ScaleOnEnter"]: ScaleOnEnter,
    ["SpringEffect"]: SpringEffectButton,
};

export const UIFrameEffectsPrototypes = {
    ["ScaleOnActivate"]: ScaleOnActivate2,
    ["SpringEffect"]: SpringEffectFrame,
    ["CurrencyPopupEffect"]: CurrencyPopupEffect,
};

export type UIButtonEffectsPrototypeKey = keyof typeof UIButtonEffectsPrototypes;
export type UIFrameEffectsPrototypeKey = keyof typeof UIFrameEffectsPrototypes;
