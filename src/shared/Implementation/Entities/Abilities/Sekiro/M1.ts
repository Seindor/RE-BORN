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

import { Sekiro_Basic_M1_Timings as timings } from "../../VFXs/Sekiro/Types/Basic_M1_Timings";

export function M1(ownerId: string) {
    let ability = abilityAPI.Create(
        {
            name: "Sekiro_M1",
            ownerId,
            states: ["Idle"],
            lastUsed: 0,
            types: [{ name: "Combat", level: 1 }],
            additionalBlacklist: ["Dash_Cast", "WeaponClick", "Block", `Parry_Cast`],
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

                let timingPackName = (character.GetAttribute(`EquippedWeapon`) as boolean)
                    ? "Equipped"
                    : "Unequipped";
                let timingPack = timings[timingPackName as keyof typeof timings];
                let timing = timingPack[`M1_${currentClick}` as keyof typeof timings.Equipped];

                ability.config.cooldown = timing.cooldown;

                ability._janitor.Add(
                    task.delay(timing.cooldown, () => {
                        ability.config.cooldown = 0;
                    }),
                    true,
                    "CooldownChange",
                );

                replicatedStatusEffectsAPI.CreateStatus(
                    ownerId,
                    { id: "WeaponClick", duration: timing.duration },
                    true,
                );

                let sekiroVFXs = VFXModules.Sekiro();

                // sekiroVFXs.Basic_M1(
                //     ownerId,
                //     character,
                //     currentClick,
                //     Workspace.GetServerTimeNow() - PingUitl.GetRealPing(ownerId),
                //     PingUitl.GetRealPing(ownerId),
                // );

                ClientSignals.Ability.fire(
                    "Sekiro_M1",
                    "Switch",
                    "Start",
                    Workspace.GetServerTimeNow(),
                );
            },
            onEnd() {},
            onInterrupt(currentClick: number) {
                let sekiroVFXs = VFXModules.Sekiro();
                let entity = entitiesStorageAPI.GetEntity(ownerId)!;
                let character = entity.entity as Model;

                replicatedStatusEffectsAPI.RemoveStatus(ownerId, "WeaponClick");
                sekiroVFXs.Destroy_Basic_M1(ownerId, character, currentClick);
            },
            onReject(serverReject?: boolean) {},
        },
    );

    return ability;
}
