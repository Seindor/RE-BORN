import { RunService } from "@rbxts/services";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { Janitor } from "@rbxts/janitor";
import { Service } from "@flamework/core";

let sharedScope = CompositionRootShared.createScope();

let entitiesStorageAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI);
let solverAPI = sharedScope.resolve(SharedRegistry.Singletons.API.SolverAPI);

@Service()
export class JumpPowerHandler {
    public janitors = new Map<string, Janitor<any>>();

    public GetJanitor(ownerId: string, character?: Model): Janitor<any> {
        if (this.janitors.has(ownerId)) return this.janitors.get(ownerId)!;
        let janitor = new Janitor<any>();

        if (character) {
            janitor.LinkToInstance(character, true);
        }

        this.janitors.set(ownerId, janitor);
        return janitor;
    }

    public Init(ownerId: string) {
        let janitor = this.GetJanitor(ownerId);
        let jumpPowerSolver = solverAPI.GetSolver(`JumpPower_Solver_${ownerId}`);

        janitor.Add(
            task.spawn(() => {
                while (jumpPowerSolver === undefined) {
                    jumpPowerSolver = solverAPI.GetSolver(`JumpPower_Solver_${ownerId}`);
                    task.wait(0.15);
                }

                jumpPowerSolver!.Subscribe(
                    ["Set", "Add", "Remove"],
                    `${ownerId}_JumpPower_Update`,
                    (...args: unknown[]) => {
                        let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                        let character = entity.entity as Model;
                        let humanoid = character.WaitForChild("Humanoid") as Humanoid;

                        let newJumpPower = jumpPowerSolver!.CalculateValue(40);

                        humanoid.JumpPower = newJumpPower;
                        character.SetAttribute(`JumpPower`, newJumpPower);
                    },
                );
            }),
            true,
            `JumpPowerHandler`,
        );
    }
}
