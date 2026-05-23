import { ReplicatedStorage } from "@rbxts/services";
import { Controller, Dependency, OnStart } from "@flamework/core";

import { init } from "@zilibobi/forge-vfx";

@Controller()
export class ClientGameApplication implements OnStart {
    onStart(): void {
        init();
    }
}
