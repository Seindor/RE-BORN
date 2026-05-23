export type IPlayerInterface = {
    ["UI"]: {
        ["HUD"]: {
            ["HealthBar"]: {
                ["arrows"]: {
                    ["leftArrow"]: ImageLabel;
                    ["rightArrow"]: ImageLabel;
                } & Frame;
                ["background"]: ImageLabel;
                ["container"]: {
                    ["bar"]: {
                        ["UIGradient"]: UIGradient;
                    } & ImageLabel;
                } & TextButton;
            } & Frame;
            ["Hotbar"]: {
                ["UIListLayout"]: UIListLayout;
                ["item"]: {
                    ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                    ["background"]: {
                        ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                    } & ImageLabel;
                    ["icon"]: {
                        ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                    } & Frame;
                    ["itemName"]: {
                        ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                    } & TextLabel;
                } & TextButton;
            } & Frame;
            ["PostureBar"]: {
                ["arrows"]: {
                    ["UIListLayout"]: UIListLayout;
                    ["leftArrow"]: ImageLabel;
                    ["rightArrow"]: ImageLabel;
                } & Frame;
                ["background"]: ImageLabel;
                ["container"]: TextButton;
                ["glow"]: {
                    ["UIListLayout"]: UIListLayout;
                    ["rightArrow"]: ImageLabel;
                    ["rightArrow"]: ImageLabel;
                } & Frame;
                ["leftContainer"]: {
                    ["bar"]: {
                        ["UIGradient"]: UIGradient;
                        ["bar"]: ImageLabel;
                        ["blur"]: ImageLabel;
                    } & Frame;
                } & Frame;
                ["rightContainer"]: {
                    ["bar"]: {
                        ["bar"]: ImageLabel;
                        ["blur"]: ImageLabel;
                    } & Frame;
                } & Frame;
            } & Frame;
            ["UIListLayout"]: UIListLayout;
        } & Frame;
        ["Inventory"]: {
            ["Inventory"]: {
                ["ImageLabel"]: ImageLabel;
                ["ScrollingFrame"]: {
                    ["UIListLayout"]: UIListLayout;
                    ["item"]: {
                        ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        ["background"]: {
                            ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        } & ImageLabel;
                        ["icon"]: {
                            ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        } & Frame;
                        ["itemName"]: {
                            ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        } & TextLabel;
                    } & TextButton;
                } & ScrollingFrame;
                ["search"]: {
                    ["TextBox"]: {
                        ["UITextSizeConstraint"]: UITextSizeConstraint;
                    } & TextBox;
                    ["UIGradient"]: UIGradient;
                } & Frame;
            } & Frame;
            ["PlayerStats"]: {
                ["TextLabel"]: TextLabel;
                ["TextLabel"]: TextLabel;
                ["background"]: ImageLabel;
                ["player"]: Frame;
                ["stats"]: Frame;
            } & Frame;
            ["UIListLayout"]: UIListLayout;
        } & Frame;
        ["Skills"]: {
            ["Cooldowns"]: {
                ["UIListLayout"]: UIListLayout;
                ["cooldown"]: {
                    ["TextLabel"]: TextLabel;
                    ["background"]: ImageLabel;
                    ["container"]: {
                        ["bar"]: ImageLabel;
                    } & Frame;
                } & Frame;
            } & Frame;
            ["Skills"]: {
                ["UIListLayout"]: UIListLayout;
                ["UIPadding"]: UIPadding;
                ["skill"]: {
                    ["UIListLayout"]: UIListLayout;
                    ["item"]: {
                        ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        ["background"]: {
                            ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        } & ImageLabel;
                        ["icon"]: {
                            ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        } & Frame;
                        ["itemName"]: {
                            ["UIAspectRatioConstraint"]: UIAspectRatioConstraint;
                        } & TextLabel;
                    } & TextButton;
                    ["skillButton"]: TextLabel;
                } & ImageButton;
            } & Frame;
        } & Frame;
    } & Frame;
    ["background"]: ImageLabel;
} & ScreenGui;
