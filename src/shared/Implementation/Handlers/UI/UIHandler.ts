import { Players, StarterGui, Workspace } from "@rbxts/services";
import LayoutUtil from "@rbxts/layoututil";

import { IPlayerInterface } from "shared/Types/UI/IPlayerInterface";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { UITemplates } from "shared/Implementation/Entities/Templates/UI";
import { Janitor } from "@rbxts/janitor";
import { AbbreviateModule } from "shared/Utilities/AbbreviateModule";

import { UIFrameAggregate } from "shared/Domain/UIWrapper/Aggregates/UIFrameAggregate";
import { Dependency } from "@flamework/core";
import { ClientAtomReplication } from "shared/Application/ClientAtomReplication";

let sharedScope = CompositionRootShared.createScope();

export class UIHandler {
    public _janitor = new Janitor<any>();
    public playerInterface: IPlayerInterface;
    public layouts = [] as UIListLayout[];

    constructor() {
        let player = Players.LocalPlayer as Player;
        let playerUI = player.WaitForChild("PlayerGui")! as PlayerGui;

        this.playerInterface = playerUI.WaitForChild("Interface") as IPlayerInterface;

        let sampleInterface = StarterGui.WaitForChild("Interface")! as IPlayerInterface;

        while (
            this.playerInterface.GetDescendants().size() < sampleInterface.GetDescendants().size()
        ) {
            task.wait();
            print(
                `Waiting for ui loads, ${this.playerInterface.GetDescendants().size()!} / ${sampleInterface.GetDescendants().size()}`,
            );
        }

        task.spawn(() => {
            const atomReplication = Dependency<ClientAtomReplication>();

            while (!atomReplication.GetLocalPlayerData) {
                task.wait();
            }

            this.AutoScaleUiStroke();
        });
    }

    private AutoScaleUiStroke() {
        let player = Players.LocalPlayer as Player;
        let playerUI = player.WaitForChild("PlayerGui")! as PlayerGui;

        function ScaleStroke(stroke: UIStroke) {
            const baseThikness = stroke.Thickness;
            const scaleFactor = Workspace.CurrentCamera!.ViewportSize.X / 1920;
            stroke.Thickness = baseThikness * scaleFactor;
        }

        function AutoScale() {
            for (const gui of playerUI.GetDescendants()) {
                if (gui.IsA("UIStroke")) {
                    ScaleStroke(gui);
                }
            }
        }

        AutoScale();

        playerUI.DescendantAdded.Connect((descendant) => {
            if (descendant.IsA("UIStroke")) {
                ScaleStroke(descendant);
            }
        });
    }

    private GetTargetUDim2(moving: GuiObject, target: GuiObject, offset?: UDim2): UDim2 {
        const parent = moving.Parent as GuiObject;
        const parentAbsPos = parent.AbsolutePosition;
        const parentAbsSize = parent.AbsoluteSize;

        const relativePos = target.AbsolutePosition.sub(parentAbsPos).add(
            target.AbsoluteSize.mul(target.AnchorPoint),
        );

        const base = new UDim2(
            relativePos.X / parentAbsSize.X,
            0,
            relativePos.Y / parentAbsSize.Y,
            0,
        );

        return offset ? base.add(offset) : base;
    }
}
