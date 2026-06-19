import { Workspace, RunService, ReplicatedStorage } from "@rbxts/services";

import { ClientSignals } from "../../ClientSignals";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import TweenMath from "shared/Utilities/TweenMath";
import { IAnimations } from "shared/Types/Assets/Animations";
import { AllSoundPaths, SoundsUtil } from "shared/Utilities/SoundsUtil";
import { VFXModules } from "../../VFXs";
import { PingUitl } from "shared/Utilities/PingUtil";

const sharedScope = CompositionRootShared.createScope();

const abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);
const entitiesStorageAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI);
const replicatedStatusEffectsAPI = sharedScope.resolve(
    SharedRegistry.Singletons.API.ReplicatedStatusEffectsAPI,
);
const assetsHelperAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AssetsHelperAPI);
const motionAPI = sharedScope.resolve(SharedRegistry.Singletons.API.MotionAPI);
const animationsAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AnimationsAPI);
const eventBusAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI);

const Assets = ReplicatedStorage.WaitForChild("Assets") as Folder;
const Animations = Assets.WaitForChild("Animations") as Folder;
const DefaultAnimations = Animations.WaitForChild("Default") as IAnimations;

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
        },
        {
            onStartCheck() {
                if (
                    replicatedStatusEffectsAPI.CheckReplicatedStatuses(
                        ownerId,
                        ability.GetBlacklist(),
                        ability.config.ignoreList ?? [],
                    )
                ) {
                    return false;
                }

                if (
                    replicatedStatusEffectsAPI.CheckClientStatuses(
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
                    replicatedStatusEffectsAPI.CheckReplicatedStatuses(
                        ownerId,
                        ability.GetBlacklist(),
                        ability.config.ignoreList ?? [],
                    )
                ) {
                    return false;
                }

                if (
                    replicatedStatusEffectsAPI.CheckClientStatuses(
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

                let sekiroVFXs = VFXModules.Sekiro();

                ClientSignals.Ability.fire("Sekiro_Block", "Hold", "Start");

                sekiroVFXs.Block(ownerId, character, Workspace.GetServerTimeNow());
                replicatedStatusEffectsAPI.CreateStatus(
                    ownerId,
                    { id: "Block", duration: math.huge },
                    true,
                );

                ability._janitor.Add(
                    RunService.Heartbeat.Connect(() => {
                        if (!ability.config.states.includes("Holding")) {
                            ability.Execute("End", true);
                            return;
                        }
                    }),
                    "Disconnect",
                    "BlockCheck",
                );
            },
            onEnd() {
                if (
                    replicatedStatusEffectsAPI.CheckReplicatedStatuses(
                        ownerId,
                        ability.GetBlacklist(),
                        ability.config.ignoreList ?? [],
                    )
                ) {
                    return;
                }

                if (
                    replicatedStatusEffectsAPI.CheckClientStatuses(
                        ownerId,
                        ability.GetBlacklist(),
                        ability.config.ignoreList ?? [],
                    )
                ) {
                    return;
                }

                let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                let character = entity.entity as Model;

                let sekiroVFXs = VFXModules.Sekiro();

                ability._janitor.Remove("BlockCheck");

                ClientSignals.Ability.fire("Sekiro_Block", "Hold", "End");

                replicatedStatusEffectsAPI.RemoveStatus(ownerId, "Block");
                sekiroVFXs.BlockStop(ownerId, character, Workspace.GetServerTimeNow());
            },
            onInterrupt() {
                ability._janitor.Remove("BlockCheck");
            },
            onReject(serverReject?: boolean) {
                if (serverReject) {
                    let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                    let character = entity.entity as Model;

                    let sekiroVFXs = VFXModules.Sekiro();

                    ability._janitor.Remove("BlockCheck");

                    //ClientSignals.Ability.fire("Sekiro_Block", "Hold", "Reject");

                    replicatedStatusEffectsAPI.RemoveStatus(ownerId, "Block");
                    sekiroVFXs.BlockStop(ownerId, character, Workspace.GetServerTimeNow());
                }
            },
        },
    );

    return ability;
}
