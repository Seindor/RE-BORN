import { Players, Workspace, RunService } from "@rbxts/services";

import { Dependency } from "@flamework/core";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { StepRunner } from "server/Application/StepRunner";

const sharedScope = CompositionRootShared.createScope();
const serverScope = CompositionRootServer.createScope();

const abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);
const entitiesStorageAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI);
const statusEffectsAPI = serverScope.resolve(ServerRegistry.Singletons.API.StatusEffectsAPI);
const solverAPI = sharedScope.resolve(SharedRegistry.Singletons.API.SolverAPI);
const traceClipAPI = sharedScope.resolve(SharedRegistry.Singletons.API.TraceClipAPI);

export function Block(ownerId: string) {
    let ability = abilityAPI.Create(
        {
            name: "Sekiro_Block",
            ownerId,
            states: ["Idle"],
            lastUsed: 0,
            types: [{ name: "Defense", level: 1 }],
            additionalBlacklist: [`Dash`, `WeaponClick`, `BlockBreak`],
            cooldown: 0.25,
            duration: math.huge,
            minDuration: 0,
            miscData: new Map<string, unknown>(),
        },
        {
            onStartCheck() {
                if (
                    statusEffectsAPI.CheckStatuses(
                        ownerId,
                        ability.GetBlacklist(),
                        ability.config.ignoreList ?? [],
                    )
                ) {
                    return false;
                }

                return true;
            },
            onEndCheck() {
                if (
                    statusEffectsAPI.CheckStatuses(
                        ownerId,
                        ability.GetBlacklist(),
                        ability.config.ignoreList ?? [],
                    )
                ) {
                    return false;
                }

                return true;
            },
            onStart() {
                let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                let character = entity.entity as Model;

                let walkSpeedSolver = solverAPI.GetSolver(`WalkSpeed_Solver_${ownerId}`)!;

                statusEffectsAPI.Subscribe(
                    ownerId,
                    [{ status: `BlockBreak`, event: `Added` }],
                    (event, status) => {
                        this.onInterrupt();
                        statusEffectsAPI.Unsubscribe(ownerId, `BlockBreakCheck`);
                    },
                    `BlockBreakCheck`,
                );

                statusEffectsAPI.CreateStatus("Block", { duration: math.huge }, true, ownerId);
                statusEffectsAPI.CreateStatus(
                    "EquippedWeapon",
                    { duration: math.huge },
                    true,
                    ownerId,
                );

                walkSpeedSolver.AddSolverNumber({
                    phaseName: "Multiplier",
                    sourceId: "Block",
                    value: 0.5,
                    tags: ["Block"],
                });

                entity.SetState("LastLaunchedVFX", [
                    "Sekiro",
                    "Block",
                    ownerId,
                    character,
                    Workspace.GetServerTimeNow(),
                ]);

                ability._janitor.Add(
                    RunService.Heartbeat.Connect(() => {
                        if (!ability.config.states.includes("Holding")) {
                            ability.Execute("End", true);
                        }
                    }),
                    "Disconnect",
                    "BlockCheck",
                );

                if (entity.HasTag("Player")) {
                    ServerSignals.LaunchVFX.except(
                        Players.GetPlayerFromCharacter(character)!,
                        "Sekiro",
                        "Block",
                        ownerId,
                        character,
                        Workspace.GetServerTimeNow(),
                    );
                } else {
                    ServerSignals.LaunchVFX.broadcast(
                        "Sekiro",
                        "Block",
                        ownerId,
                        character,
                        Workspace.GetServerTimeNow(),
                    );
                }
            },
            onEnd() {
                let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                let character = entity.entity as Model;

                let walkSpeedSolver = solverAPI.GetSolver(`WalkSpeed_Solver_${ownerId}`)!;

                ability._janitor.Remove("BlockCheck");
                statusEffectsAPI.RemoveStatus(ownerId, "Block");
                statusEffectsAPI.CreateStatus(`EquippedWeapon`, undefined, true, ownerId);

                walkSpeedSolver.RemoveSolverNumber("Block");

                entity.SetState("LastLaunchedVFX", [
                    "Sekiro",
                    "BlockStop",
                    ownerId,
                    character,
                    Workspace.GetServerTimeNow(),
                ]);

                if (entity.HasTag("Player")) {
                    ServerSignals.LaunchVFX.except(
                        Players.GetPlayerFromCharacter(character)!,
                        "Sekiro",
                        "BlockStop",
                        ownerId,
                        character,
                        Workspace.GetServerTimeNow(),
                    );
                } else {
                    ServerSignals.LaunchVFX.broadcast(
                        "Sekiro",
                        "BlockStop",
                        ownerId,
                        character,
                        Workspace.GetServerTimeNow(),
                    );
                }
            },
            onInterrupt() {
                let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                let character = entity.entity as Model;

                let walkSpeedSolver = solverAPI.GetSolver(`WalkSpeed_Solver_${ownerId}`)!;

                ability._janitor.Remove("BlockCheck");
                statusEffectsAPI.RemoveStatus(ownerId, "Block");
                statusEffectsAPI.CreateStatus(`EquippedWeapon`, undefined, true, ownerId);

                walkSpeedSolver.RemoveSolverNumber("Block");

                entity.SetState("LastLaunchedVFX", [
                    "Sekiro",
                    "BlockStop",
                    ownerId,
                    character,
                    Workspace.GetServerTimeNow(),
                ]);

                ServerSignals.LaunchVFX.broadcast(
                    "Sekiro",
                    "BlockStop",
                    ownerId,
                    character,
                    Workspace.GetServerTimeNow(),
                );
            },
            onReject() {
                let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                let character = entity.entity as Model;

                let walkSpeedSolver = solverAPI.GetSolver(`WalkSpeed_Solver_${ownerId}`)!;

                ability._janitor.Remove("BlockCheck");
                statusEffectsAPI.RemoveStatus(ownerId, "Block");

                walkSpeedSolver.RemoveSolverNumber("Block");

                entity.SetState("LastLaunchedVFX", [
                    "Sekiro",
                    "BlockStop",
                    ownerId,
                    character,
                    Workspace.GetServerTimeNow(),
                ]);

                if (entity.HasTag("Player")) {
                    ServerSignals.Ability.fire(
                        Players.GetPlayerFromCharacter(character)!,
                        "Sekiro_Block",
                        "Hold",
                        "Reject",
                        true,
                    );
                    ServerSignals.LaunchVFX.except(
                        Players.GetPlayerFromCharacter(character)!,
                        "Sekiro",
                        "BlockStop",
                        ownerId,
                        character,
                        Workspace.GetServerTimeNow(),
                    );
                } else {
                    ServerSignals.LaunchVFX.broadcast(
                        "Sekiro",
                        "BlockStop",
                        ownerId,
                        character,
                        Workspace.GetServerTimeNow(),
                    );
                }
            },
        },
    );

    return ability;
}
