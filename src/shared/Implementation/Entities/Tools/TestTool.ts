import { Players } from "@rbxts/services";
import { Controller, OnStart } from "@flamework/core";
import { ToolApi as _ToolApi } from "shared/Domain/Tool/API/ToolApi";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";

const SharedScope = CompositionRootShared.createScope();

@Controller()
export class TestTool implements OnStart {
    onStart(): void {
        const ToolApi = SharedScope.resolve(SharedRegistry.Singletons.API.ToolAPI);
        const EventBusAPI = SharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI);

        const _Player = Players.LocalPlayer as Player;
        const backpack = _Player.WaitForChild("Backpack");

        const ToolsBus = EventBusAPI.New(tostring(_Player.UserId), "Tools");

        const _Tool = ToolApi.NewTool(
            {
                name: "Switch",
                canBeDropped: false,
                requireHandle: false,
            },
            1,
        );

        _Tool.OnEquipped(() => {
            print("Equipped");
        });

        _Tool.OnUnequipped(() => {
            print("Unequipped");
        });

        _Tool.OnActivated(() => {
            print("Activated");
        });

        _Tool.OnDeactivated(() => {
            print("Deactivated");
        });

        _Tool.instance.Parent = backpack;

        ToolsBus.FireSync("ToolCreated", undefined, true, _Tool, "Weapon");
    }
}
