import { TweenService, ReplicatedStorage, Workspace } from "@rbxts/services";

import { Controller } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { SoundsUtil } from "shared/Utilities/SoundsUtil";
import { emit } from "@zilibobi/forge-vfx";

let sharedScope = CompositionRootShared.createScope();

let assetsHelperAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AssetsHelperAPI);

let Assets = ReplicatedStorage.WaitForChild("Assets") as Folder;
let VFXs = Assets.WaitForChild("VFXs") as Folder;
let DefaultVFXs = VFXs.WaitForChild("Default") as Folder;

@Controller()
export class Dash {
    public _janitor = new Janitor<any>();

    public Dash_Emit(character: Model, ownerId: string) {
        this._janitor.Add(
            task.spawn(() => {
                let humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

                let sound = SoundsUtil.CreateSound(`Default/Dashes/Dash`);
                sound.Parent = humanoidRootPart;
                SoundsUtil.PlaySound(sound, true);

                this._janitor.Add(sound, "Destroy", `${ownerId}_DashSound`);

                let rayOrigin = humanoidRootPart.Position;
                let rayDirection = humanoidRootPart.CFrame.UpVector.mul(-5);
                let rayParams = new RaycastParams();
                rayParams.FilterType = Enum.RaycastFilterType.Exclude;
                rayParams.FilterDescendantsInstances = [
                    character,
                    Workspace.WaitForChild("Map")!.WaitForChild("Players") as Folder,
                    Workspace.WaitForChild("Map")!.WaitForChild("NPCs") as Folder,
                ];

                let rayResult = Workspace.Raycast(rayOrigin, rayDirection, rayParams);

                if (rayResult) {
                    if (rayResult.Instance) {
                        let dashEffect = DefaultVFXs.WaitForChild(
                            "Dash_Effect",
                        ).Clone() as BasePart;
                        this._janitor.Add(dashEffect, "Destroy", `${ownerId}_Dash_Effect`);
                        dashEffect.Parent = Workspace.WaitForChild("Map")!.WaitForChild(
                            "Debris",
                        ) as Folder;

                        dashEffect.Position = rayResult.Position;
                        emit(dashEffect);

                        task.delay(1.7, () => {
                            this._janitor.Remove(`${ownerId}_Dash_Effect`);
                        });
                    }
                }
            }),
            true,
            `${ownerId}_DashEmit`,
        );
    }

    public Interrupt(character: Model, ownerId: string) {
        this._janitor.Remove(`${ownerId}_DashEmit`);
        this._janitor.Remove(`${ownerId}_DashSound`);
    }
}
