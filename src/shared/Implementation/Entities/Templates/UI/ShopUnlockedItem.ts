import Fusion, { Children } from "@rbxts/fusion";

export type IShopUnlockedItem = {
    Background: {
        UIAspectRatioConstraint: UIAspectRatioConstraint;
        UICorner: UICorner;
        UIStroke: UIStroke;
        Background2: {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIGradient: UIGradient;
            Icon: ImageLabel;
        } & Frame;
        UIScale: UIScale;
    } & Frame;
} & TextButton;

export function CreateShopUnlockedItem(): IShopUnlockedItem {
    const ShopUnlockedItem = Fusion.New("TextButton")({
        Name: "UnlockedItem",
        AutoButtonColor: false,
        BackgroundColor3: Color3.fromRGB(255, 183, 0),
        BackgroundTransparency: 1,
        BorderColor3: new Color3(),
        BorderSizePixel: 0,
        Position: new UDim2(-0.000320408, 0, -6.1111e-8, 0),
        Selectable: false,
        Size: new UDim2(0.157, 0, 0.303, 0),
        Text: "",

        [Children]: [
            Fusion.New("Frame")({
                Name: "Background",
                AnchorPoint: new Vector2(0.5, 0.5),
                BackgroundColor3: Color3.fromRGB(255, 183, 0),
                Position: new UDim2(0.5, 0, 0.5, 0),
                Size: new UDim2(1, 0, 1, 0),

                [Children]: [
                    Fusion.New("UIAspectRatioConstraint")({
                        Name: "UIAspectRatioConstraint",
                    }),

                    Fusion.New("UICorner")({
                        Name: "UICorner",
                        CornerRadius: new UDim(0.1, 0),
                    }),

                    Fusion.New("UIStroke")({
                        Name: "UIStroke",
                        ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
                        Color: Color3.fromRGB(93, 31, 31),
                        Thickness: 7.5,
                    }),

                    Fusion.New("Frame")({
                        Name: "Background2",
                        BackgroundColor3: new Color3(1, 1, 1),
                        Position: new UDim2(-0.000270102, 0, 0, 0),
                        Size: new UDim2(1, 0, 0.970942, 0),

                        [Children]: [
                            Fusion.New("UICorner")({
                                Name: "UICorner",
                                CornerRadius: new UDim(0.1, 0),
                            }),

                            Fusion.New("UIStroke")({
                                Name: "UIStroke",
                                Color: Color3.fromRGB(255, 200, 172),
                                Thickness: 2.9,
                            }),

                            Fusion.New("UIGradient")({
                                Name: "UIGradient",
                                Color: new ColorSequence([
                                    new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(255, 230, 230)),
                                ]),
                                Rotation: 79,
                            }),

                            Fusion.New("ImageLabel")({
                                Name: "Icon",
                                BackgroundTransparency: 1,
                                Image: "rbxassetid://16911678024",
                                Size: new UDim2(1, 0, 1, 0),
                            }),
                        ],
                    }),

                    Fusion.New("UIScale")({
                        Name: "UIScale",
                    }),
                ],
            }),
        ],
    }) as IShopUnlockedItem;

    return ShopUnlockedItem;
}
