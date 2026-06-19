import { Workspace, RunService, ReplicatedStorage } from "@rbxts/services";

import { ClientSignals } from "../../ClientSignals";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import TweenMath from "shared/Utilities/TweenMath";
import { IAnimations } from "shared/Types/Assets/Animations";
import { AllSoundPaths, SoundsUtil } from "shared/Utilities/SoundsUtil";
import { VFXModules } from "../../VFXs";

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
            cooldown: 0.05,
            duration: 0,
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
                return true;
            },
            onStart() {
                let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                let character = entity.entity as Model;

                let sekiroVFXs = VFXModules.Sekiro();

                replicatedStatusEffectsAPI.CreateStatus(
                    ownerId,
                    { id: `Parry_Cast`, duration: 0.15 },
                    true,
                );

                ClientSignals.Ability.fire("Sekiro_Parry", "Switch", "Start");
            },
            onEnd() {},
            onInterrupt() {},
            onReject(serverReject?: boolean) {},
        },
    );

    return ability;
}
