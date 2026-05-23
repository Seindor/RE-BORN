import Fusion, { Children } from "@rbxts/fusion";

export type ICurrencyPopup = {
    Counter: {
        Strength_Stroke: UIStroke;
        Coins_Stroke: UIStroke;
        Souls_Stroke: UIStroke;
    } & TextLabel;
    StatIcon: {
        UIAspectRatioConstraint: UIAspectRatioConstraint;
    } & ImageLabel;
    UIScale: UIScale;
} & Frame;

export function CreateCurrencyPop(): ICurrencyPopup {
    const CurrencyPopup = Fusion.New("Frame")({
        Name: "CurrencyPopup",
        AnchorPoint: new Vector2(0, 0.5),
        BackgroundTransparency: 1,
        Position: new UDim2(0.456325, 0, 0.452952, 0),
        Size: new UDim2(0, 179, 0, 52),

        [Children]: [
            Fusion.New("TextLabel")({
                Name: "Counter",
                BackgroundTransparency: 1,
                FontFace: new Font("rbxasset://fonts/families/FredokaOne.json"),
                Position: new UDim2(0.287618, 0, 0.308678, 0),
                Size: new UDim2(0.723744, 0, 0.571918, 0),
                Text: "+999M",
                TextColor3: new Color3(1, 1, 1),
                TextScaled: true,
                TextXAlignment: Enum.TextXAlignment.Left,
                ZIndex: 4,

                [Children]: [
                    Fusion.New("UIStroke")({
                        Name: "Strength_Stroke",
                        Color: Color3.fromRGB(109, 69, 47),
                        Enabled: false,
                        Thickness: 3.4,
                    }),

                    Fusion.New("UIStroke")({
                        Name: "Coins_Stroke",
                        Color: Color3.fromRGB(127, 84, 16),
                        Enabled: false,
                        Thickness: 3.4,
                    }),

                    Fusion.New("UIStroke")({
                        Name: "Souls_Stroke",
                        Color: Color3.fromRGB(98, 98, 98),
                        Enabled: false,
                        Thickness: 3.4,
                    }),
                ],
            }),

            Fusion.New("ImageLabel")({
                Name: "StatIcon",
                BackgroundTransparency: 1,
                Image: "rbxassetid://101434342822573",
                ImageColor3: Color3.fromRGB(255, 214, 180),
                Position: new UDim2(-6.93581e-7, 0, 0, 0),
                Size: new UDim2(0.276255, 0, 1, 0),
                ZIndex: 3,

                [Children]: [
                    Fusion.New("UIAspectRatioConstraint")({
                        Name: "UIAspectRatioConstraint",
                    }),
                ],
            }),

            Fusion.New("UIScale")({
                Name: "UIScale",
            }),
        ],
    }) as ICurrencyPopup;

    return CurrencyPopup;
}
