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

export function Parry(ownerId: string) {
    let ability = abilityAPI.Create(
        {
            name: "Sekiro_Parry",
            ownerId,
            states: ["Idle"],
            lastUsed: 0,
            types: [{ name: "Defense", level: 1 }],
            additionalBlacklist: ["Dash", "WeaponClick"],
            ignoreList: [{ id: "Stun", maxPriority: 1 }],
            cooldown: 2,
            duration: 0.5,
            minDuration: 0.5,
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

                statusEffectsAPI.CreateStatus(
                    "Parry",
                    { duration: 0.5, stackingPolicy: "Refresh" },
                    true,
                    ownerId,
                );

                statusEffectsAPI.CreateStatus(
                    "Parry_Cast",
                    { duration: 0.25, stackingPolicy: "Refresh" },
                    true,
                    ownerId,
                );

                if (statusEffectsAPI.HasStatus(ownerId, `EquippedWeapon`)) {
                    let status = statusEffectsAPI.GetStatus(ownerId, `EquippedWeapon`)!;

                    if (status.duration !== math.huge) {
                        statusEffectsAPI.CreateStatus(`EquippedWeapon`, undefined, true, ownerId);
                    }
                } else {
                    statusEffectsAPI.CreateStatus(`EquippedWeapon`, undefined, true, ownerId);
                }

                ServerSignals.LaunchVFX.broadcast("Sekiro", "Parry_Cast", ownerId, character);
            },
            onEnd() {},
            onInterrupt() {},
            onReject() {},
        },
    );

    return ability;
}
