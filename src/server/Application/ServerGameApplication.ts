import { Workspace } from "@rbxts/services";

import { Dependency, OnStart, Service } from "@flamework/core";
import { AccessoryQualityFixHandler } from "server/Implementation/Handlers/AccessoryQualityFixHandler";
import { StepRunner } from "./StepRunner";
import { Blocking_Dummy } from "server/Implementation/Handlers/Blocking_Dummy";
import { Dummy } from "server/Implementation/Handlers/Dummy";
import { Attack_Dummy } from "server/Implementation/Handlers/Attack_Dummy";
import { Parrying_Dummy } from "server/Implementation/Handlers/Parrying_Dummy";

let NPCs = Workspace.WaitForChild("Map")!.WaitForChild("NPCs");

@Service()
export class ServerGameApplication implements OnStart {
    onStart(): void {
        new AccessoryQualityFixHandler();
        Dependency<StepRunner>();

        new Dummy(NPCs.WaitForChild("Dummy")! as Model);
        new Blocking_Dummy(NPCs.WaitForChild("Blocking_Dummy")! as Model);
        new Parrying_Dummy(NPCs.WaitForChild("Parrying_Dummy")! as Model);

        // let Offset = 0;

        // for (let i = 1; i <= 50; i++) {
        //     let dummy = NPCs.WaitForChild("Attack_Dummy")!.Clone() as Model;
        //     let humanoidRootPart = dummy.WaitForChild(`HumanoidRootPart`) as BasePart;

        //     Offset += 15;

        //     dummy.Name = `${dummy.Name}_${math.random(1, 100000000)}`;
        //     humanoidRootPart.CFrame = humanoidRootPart.CFrame.mul(new CFrame(0, 0, Offset));
        //     dummy.Parent = Workspace.WaitForChild(`Map`).WaitForChild(`NPCs`);
        //     new Attack_Dummy(dummy);
        // }

        new Attack_Dummy(NPCs.WaitForChild("Attack_Dummy")! as Model);
    }
}
