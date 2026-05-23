import Fusion, { Children } from "@rbxts/fusion";

export type IShopLockedItem = {
    Background: {
        Background2: {
            UICorner: UICorner;
            UIStroke: UIStroke;
            UIGradient: UIGradient;
            Icon: ImageLabel;
        } & Frame;
        UIStroke: UIStroke;
        UIScale: UIScale;
        UICorner: UICorner;
        UIAspectRatioConstraint: UIAspectRatioConstraint;
    } & Frame;
} & TextButton;

export function CreateShopLockedItem(): IShopLockedItem {
    const ShopLockedItem = Fusion.New("TextButton")({
        Name: "LockedItem",
        AutoButtonColor: false,
        BackgroundColor3: Color3.fromRGB(167, 167, 167),
        BackgroundTransparency: 1,
        BorderColor3: new Color3(),
        BorderSizePixel: 0,
        Position: new UDim2(-0.000362982, 0, -1.02864e-7, 0),
        Selectable: false,
        Size: new UDim2(0.156908, 0, 0.302967, 0),
        Text: "",

        [Children]: [
            Fusion.New("Frame")({
                Name: "Background",
                AnchorPoint: new Vector2(0.5, 0.5),
                BackgroundColor3: Color3.fromRGB(167, 167, 167),
                Position: new UDim2(0.5, 0, 0.5, 0),
                Size: new UDim2(1, 0, 1, 0),

                [Children]: [
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
                                Color: Color3.fromRGB(167, 167, 167),
                                Thickness: 2.9,
                            }),

                            Fusion.New("UIGradient")({
                                Name: "UIGradient",
                                Color: new ColorSequence([
                                    new ColorSequenceKeypoint(0, new Color3(1, 1, 1)),
                                    new ColorSequenceKeypoint(1, Color3.fromRGB(240, 240, 240)),
                                ]),
                                Rotation: 90,
                            }),

                            Fusion.New("ImageLabel")({
                                Name: "Icon",
                                BackgroundTransparency: 1,
                                Image: "rbxassetid://103214657494407",
                                ImageColor3: new Color3(),
                                Position: new UDim2(0.0989353, 0, 0.112934, 0),
                                Size: new UDim2(0.8, 0, 0.8, 0),
                            }),
                        ],
                    }),

                    Fusion.New("UIStroke")({
                        Name: "UIStroke",
                        ApplyStrokeMode: Enum.ApplyStrokeMode.Border,
                        Color: Color3.fromRGB(62, 62, 62),
                        Thickness: 7.5,
                    }),

                    Fusion.New("UIScale")({
                        Name: "UIScale",
                    }),

                    Fusion.New("UICorner")({
                        Name: "UICorner",
                        CornerRadius: new UDim(0.1, 0),
                    }),

                    Fusion.New("UIAspectRatioConstraint")({
                        Name: "UIAspectRatioConstraint",
                    }),
                ],
            }),
        ],
    }) as IShopLockedItem;

    return ShopLockedItem;
}
