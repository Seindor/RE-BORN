import { Players, Workspace } from "@rbxts/services";

import { Dependency } from "@flamework/core";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";
import { StatusEffectsReplication } from "server/Application/StatusEffectsReplication";
import { IAbilityBlacklist } from "shared/Domain/Ability/Types/AbilityTypes";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { AllSoundPaths } from "shared/Utilities/SoundsUtil";
import { PingUitl } from "shared/Utilities/PingUtil";

const sharedScope = CompositionRootShared.createScope();
const serverScope = CompositionRootServer.createScope();

const abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);
const entitiesStorageAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI);
const statusEffectsAPI = serverScope.resolve(ServerRegistry.Singletons.API.StatusEffectsAPI);
const hitboxAPI = sharedScope.resolve(SharedRegistry.Singletons.API.HitboxAPI);

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
    let statusEffectsReplication = Dependency<StatusEffectsReplication>();

    let ability = abilityAPI.Create(
        {
            name: "Sekiro_M1",
            ownerId,
            states: ["Idle"],
            lastUsed: 0,
            types: [{ name: "Combat", level: 1 }],
            additionalBlacklist: ["Dash"],
            cooldown: 0.5,
            duration: 0.5,
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
                return true;
            },
            onStart() {
                let weaponClickStatus = statusEffectsAPI.CreateStatus(
                    "WeaponCurrentClick",
                    {
                        duration: 2,
                        maxStacks: 4,
                        stackingPolicy: "Add",
                        stackBehavior: "Cycle",
                    },
                    undefined,
                    ownerId,
                );

                weaponClickStatus = statusEffectsAPI.AddStatus(ownerId, weaponClickStatus);

                const currentClick = weaponClickStatus.stacks!;
                let timing = timings[`M1_${currentClick}` as keyof typeof timings];

                print(currentClick, "CurrentClick");

                const entity = entitiesStorageAPI.GetEntity(ownerId)!;
                const character = entity.entity as Model;
                const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;

                let ownerPing = PingUitl.GetRealPing(ownerId);

                let clampedOwnerPing = PingUitl.GetFixedPing(ownerId);

                statusEffectsAPI.CreateStatus(
                    "WeaponClick",
                    { duration: timing.duration },
                    true,
                    ownerId,
                );

                if (Players.GetPlayerFromCharacter(character)) {
                    ServerSignals.LaunchVFX.except(
                        Players.GetPlayerFromCharacter(character)!,
                        "Sekiro",
                        "M1",
                        ownerId,
                        character,
                        currentClick,
                        Workspace.GetServerTimeNow(),
                        ownerPing,
                        timings,
                    );
                } else {
                    ServerSignals.LaunchVFX.broadcast(
                        "Sekiro",
                        "M1",
                        ownerId,
                        character,
                        currentClick,
                        Workspace.GetServerTimeNow(),
                        ownerPing,
                        timings,
                    );
                }

                ability._janitor.Add(
                    task.delay(timing.events.hitreg, () => {
                        let hitbox = hitboxAPI.Create(
                            `${ownerId}_M1_${currentClick}_Hitbox`,
                            humanoidRootPart,
                            {
                                lifetime: math.huge,
                                hitCooldown: math.huge,
                                shape: "Block",
                                size: new Vector3(10, 10, 10),
                                offset: new CFrame(0, 0, -3),
                                debug: true,
                                filterType: Enum.RaycastFilterType.Exclude,
                                filter: [character],

                                hitCheck: (target: Instance) => {
                                    if (
                                        statusEffectsAPI.CheckStatuses(
                                            ownerId,
                                            ability.GetBlacklist(),
                                            ability.config.ignoreList ?? [],
                                        )
                                    ) {
                                        return false;
                                    }

                                    if (!target.FindFirstChild("HumanoidRootPart")) {
                                        return false;
                                    }

                                    if (entitiesStorageAPI.GetEntity(target)) {
                                        return true;
                                    }
                                    return false;
                                },

                                onHit: (target: Instance) => {
                                    const e_entity = entitiesStorageAPI.GetEntity(target)!;
                                    const e_character = e_entity.entity as Model;
                                    const e_humanoidRootPart = e_character.FindFirstChild(
                                        "HumanoidRootPart",
                                    ) as BasePart;
                                    const e_humanoid = e_character.FindFirstChild(
                                        "Humanoid",
                                    ) as Humanoid;

                                    let clampedPing = PingUitl.GetFixedPing(target);

                                    //task.wait(clampedPing);

                                    e_humanoid.TakeDamage(5);

                                    ServerSignals.PlaySound.broadcast(
                                        `Sekiro/Hits/${currentClick}` as AllSoundPaths,
                                        target.FindFirstChild("HumanoidRootPart")! as BasePart,
                                        true,
                                    );
                                },
                            },
                        );

                        task.wait(timing.events.hitend - timing.events.hitreg + clampedOwnerPing);

                        hitboxAPI.Destroy(`${ownerId}_M1_${currentClick}_Hitbox`);
                        ability._janitor.Remove(`M1_${currentClick}_Hitbox`);
                    }),
                    true,
                    `M1_${currentClick}_Hitbox`,
                );

                ability.config.cooldown = timing.cooldown;
            },
            onEnd() {},
            onInterrupt() {},
        },
    );

    return ability;
}
