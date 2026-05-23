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

const timings = {
    M1_1: {
        duration: 0.5,
        cooldown: 0.583,
        events: {
            ["mark"]: 0.25,
            ["swingreg"]: 0.333,
            ["swingend"]: 0.5,
            ["hitreg"]: 0.416,
            ["hitend"]: 0.5,
        },
    },
    M1_2: {
        duration: 0.5,
        cooldown: 0.583,
        events: {
            ["mark"]: 0.216,
            ["swingreg"]: 0.316,
            ["swingend"]: 0.5,
            ["hitreg"]: 0.383,
            ["hitend"]: 0.45,
        },
    },
    M1_3: {
        duration: 0.5,
        cooldown: 0.583,
        events: {
            ["mark"]: 0.216,
            ["swingreg"]: 0.316,
            ["swingend"]: 0.5,
            ["hitreg"]: 0.416,
            ["hitend"]: 0.466,
        },
    },
    M1_4: {
        duration: 0.5,
        cooldown: 1.5,
        events: {
            ["mark"]: 0.25,
            ["swingreg"]: 0.316,
            ["swingend"]: 0.5,
            ["hitreg"]: 0.4,
            ["hitend"]: 0.45,
        },
    },
};

export function M1(ownerId: string) {
    let ability = abilityAPI.Create(
        {
            name: "Sekiro_M1",
            ownerId,
            states: ["Idle"],
            lastUsed: 0,
            types: [{ name: "Combat", level: 1 }],
            additionalBlacklist: ["Dash", "WeaponClick"],
            cooldown: 0,
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
                task.wait(PingUitl.GetNetworkPing(ownerId));

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
                let weaponCurrentClick = replicatedStatusEffectsAPI.GetReplicatedStatus(
                    ownerId,
                    "WeaponCurrentClick",
                );

                let currentClick = weaponCurrentClick?.stacks ?? 0;
                currentClick++;

                if (currentClick > 4) {
                    currentClick = 1;
                    return;
                }

                let timing = timings[`M1_${currentClick}` as keyof typeof timings];

                print(currentClick);

                ability.config.cooldown = timing.cooldown;

                task.delay(timing.cooldown, () => {
                    ability.config.cooldown = 0;
                });

                replicatedStatusEffectsAPI.CreateStatus(
                    ownerId,
                    { id: "WeaponClick", duration: timing.duration },
                    true,
                );

                let sekiroVFXs = VFXModules.Sekiro();

                sekiroVFXs.M1(
                    ownerId,
                    character,
                    currentClick,
                    Workspace.GetServerTimeNow() - PingUitl.GetRealPing(ownerId),
                    PingUitl.GetRealPing(ownerId),
                    timings,
                );
                ClientSignals.Ability.fire("Sekiro_M1", "Start");
            },
            onEnd() {},
            onInterrupt() {},
            onReject(serverReject?: boolean) {},
        },
    );

    return ability;
}
