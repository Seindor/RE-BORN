import { Players, Workspace, ReplicatedStorage } from "@rbxts/services";

import { Dependency } from "@flamework/core";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";
import { StatusEffectsReplication } from "server/Application/StatusEffectsReplication";
import { IAbilityBlacklist } from "shared/Domain/Ability/Types/AbilityTypes";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { CompositionRootServer } from "server/DI/CompositionRootServer";
import { ServerRegistry } from "server/DI/Generated/ServerRegistry";

import { PingUitl } from "shared/Utilities/PingUtil";
import { StepRunner } from "server/Application/StepRunner";

const sharedScope = CompositionRootShared.createScope();
const serverScope = CompositionRootServer.createScope();

const abilityAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AbilityAPI);
const entitiesStorageAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI);
const animationsAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AnimationsAPI);
const statusEffectsAPI = serverScope.resolve(ServerRegistry.Singletons.API.StatusEffectsAPI);
const hitboxAPI = sharedScope.resolve(SharedRegistry.Singletons.API.HitboxAPI);
const eventBusAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI);
const phaseResolverAPI = sharedScope.resolve(SharedRegistry.Singletons.API.PhaseResolverAPI);
const solverAPI = sharedScope.resolve(SharedRegistry.Singletons.API.SolverAPI);
const traceClipAPI = sharedScope.resolve(SharedRegistry.Singletons.API.TraceClipAPI);

import { Sekiro_Basic_M1_Timings as timings } from "shared/Implementation/Entities/VFXs/Sekiro/Types/Basic_M1_Timings";
import { Default_HitContext } from "server/Implementation/Handlers/Combat/Default/Contexts/Default_HitContext";
import { AnimationsPriorities } from "shared/Types/Gameplay/AnimationTypes";

let Assets = ReplicatedStorage.WaitForChild(`Assets`);
let Animations = Assets.WaitForChild(`Animations`);
let SekiroAnimations = Animations.WaitForChild(`Sekiro`) as Folder;

export function M1(ownerId: string) {
    let statusEffectsReplication = Dependency<StatusEffectsReplication>();

    const stepRunner = Dependency<StepRunner>();

    let ability = abilityAPI.Create(
        {
            name: "Sekiro_M1",
            ownerId,
            states: ["Idle"],
            additionalBlacklist: ["Block", "Parry_Cast"],
            lastUsed: 0,
            types: [{ name: "Combat", level: 1 }],
            cooldown: 0.5,
            duration: 0.5,
            minDuration: 0,
            miscData: new Map<string, unknown>(),
        },
        {
            onStartCheck(clientTime: number) {
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
            onStart(clientTime: number) {
                let walkSpeedSolver = solverAPI.GetSolver(`WalkSpeed_Solver_${ownerId}`)!;
                let jumpPowerSolver = solverAPI.GetSolver(`JumpPower_Solver_${ownerId}`)!;

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

                const entity = entitiesStorageAPI.GetEntity(ownerId)!;
                const character = entity.entity as Model;
                const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;

                const equippedWeapon = statusEffectsAPI.HasStatus(ownerId, `EquippedWeapon`);

                let combatAnimator = animationsAPI.CreateAnimator(
                    { Character: character },
                    `Combat`,
                    ownerId,
                );

                let ownerPing = PingUitl.GetRealPing(ownerId);

                let clampedOwnerPing = PingUitl.GetFixedPing(ownerId);

                const currentClick = weaponClickStatus.stacks!;
                let timingPack = equippedWeapon ? "Equipped" : "Unequipped";
                let timing =
                    timings[timingPack as keyof typeof timings][
                        `M1_${currentClick}` as keyof typeof timings.Equipped
                    ];

                if (!clientTime) {
                    clientTime = 0;
                }

                let offset = math.clamp(Workspace.GetServerTimeNow() - clientTime, 0, 0.15);

                statusEffectsAPI.Subscribe(
                    ownerId,
                    [
                        { status: "Stun", event: "Added" },
                        { status: "Dash", event: "Added" },
                        { status: "Block", event: "Added" },
                    ],
                    () => {
                        ability.Interrupt(currentClick, ownerPing);

                        statusEffectsAPI.Unsubscribe(ownerId, `M1_Statuses_Subscribe`);
                    },
                    `M1_Statuses_Subscribe`,
                );

                statusEffectsAPI.CreateStatus(
                    "WeaponClick",
                    { duration: timing.duration },
                    true,
                    ownerId,
                );

                walkSpeedSolver.AddSolverNumber({
                    sourceId: `M1`,
                    phaseName: `Multiplier`,
                    value: 0.5,
                    tags: [`M1`],
                });

                jumpPowerSolver.AddSolverNumber({
                    sourceId: `M1`,
                    phaseName: `Multiplier`,
                    value: 0,
                    tags: [`M1`],
                });

                ability._janitor.Add(
                    task.delay(timing.duration + 0.15, () => {
                        walkSpeedSolver.RemoveSolverNumber(`M1`);
                        jumpPowerSolver.RemoveSolverNumber(`M1`);
                    }),
                    true,
                    `ReturnMovement`,
                );

                const animToPlay = SekiroAnimations.WaitForChild(`Combat`)
                    .FindFirstChild(equippedWeapon ? "Unsheath_M1" : "Sheath_M1")!
                    .FindFirstChild(`M1_${currentClick}`) as Animation;

                entity.SetState("LastLaunchedVFX", [
                    "Sekiro",
                    "Basic_M1",
                    ownerId,
                    character,
                    currentClick,
                    animToPlay,
                    ownerPing,
                ]);

                let animation = combatAnimator.PlayAnimation(
                    animToPlay,
                    `M1_${currentClick}`,
                    false,
                    AnimationsPriorities.CombatAnimation,
                    false,
                    0.25,
                );

                statusEffectsAPI.CreateStatus(`EquippedWeapon`, undefined, true, ownerId);

                // if (Players.GetPlayerFromCharacter(character)) {
                //     ServerSignals.LaunchVFX.except(
                //         Players.GetPlayerFromCharacter(character)!,
                //         "Sekiro",
                //         "Basic_M1",
                //         ownerId,
                //         character,
                //         currentClick,
                //         Workspace.GetServerTimeNow(),
                //         ownerPing,
                //     );
                // } else {
                ServerSignals.LaunchVFX.broadcast(
                    "Sekiro",
                    "Basic_M1",
                    ownerId,
                    character,
                    currentClick,
                    animToPlay,
                    Workspace.GetServerTimeNow(),
                    ownerPing,
                );
                //}

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

                                prediction: {
                                    enabled: true,
                                    rewindTime: offset,
                                },

                                hitCheck: (target: Instance) => {
                                    if (!target.FindFirstChild("HumanoidRootPart")) {
                                        return false;
                                    }

                                    if (
                                        statusEffectsAPI.CheckStatuses(
                                            ownerId,
                                            ability.GetBlacklist(),
                                            ability.config.ignoreList ?? [],
                                        )
                                    ) {
                                        return false;
                                    }

                                    if (entitiesStorageAPI.GetEntity(target)) {
                                        return true;
                                    }
                                    return false;
                                },

                                onHit: (target: Instance) => {
                                    const targetEntity = entitiesStorageAPI.GetEntity(target)!;
                                    const targetId = targetEntity.id;

                                    if (entity.HasTag("NPC")) {
                                        let targetPing = PingUitl.GetFixedPing(targetId);
                                        task.wait(targetPing);
                                    }

                                    // Контекст удара
                                    const hitCtx: Default_HitContext = {
                                        damage: { health: 5, posture: 20 },
                                        ownerId,
                                        ability: ability,
                                        targetId,

                                        tags: ["M1", "Melee"],
                                        miscData: new Map<string, unknown>(),
                                    };

                                    hitCtx.miscData.set(`CurrentClick`, currentClick);

                                    // Пассивки цели могут изменить контекст
                                    const targetBus = eventBusAPI.Get(targetId, "Combat");
                                    targetBus.FireSync("PreDamageTake", 1, false, hitCtx);

                                    // PhaseResolver решает что произошло
                                    const hitResolver =
                                        phaseResolverAPI.GetResolver<Default_HitContext>(
                                            targetId,
                                            "Default_M1_Resolver",
                                        )!;

                                    stepRunner.Run(
                                        { stepType: "PVP", ownerId, targetId },
                                        (emit) => {
                                            hitResolver.Resolve(hitCtx, emit);
                                        },
                                    );
                                },
                            },
                        );
                    }),
                    true,
                    `M1_${currentClick}_Hitbox`,
                );

                ability._janitor.Add(
                    task.delay(timing.events.hitend, () => {
                        hitboxAPI.Destroy(`${ownerId}_M1_${currentClick}_Hitbox`);
                        ability._janitor.Remove(`M1_${currentClick}_Hitbox`);
                    }),
                    true,
                    `M1_${currentClick}_Hitbox_Destroy`,
                );

                ability.config.cooldown = timing.cooldown;
            },
            onEnd() {
                statusEffectsAPI.Unsubscribe(ownerId, `M1_Statuses_Subscribe`);
            },
            onInterrupt(currentClick: number, ownerPing: number) {
                const entity = entitiesStorageAPI.GetEntity(ownerId)!;
                const character = entity.entity as Model;
                const humanoidRootPart = character.FindFirstChild("HumanoidRootPart") as BasePart;
                let combatAnimator = animationsAPI.CreateAnimator(
                    { Character: character },
                    `Combat`,
                    ownerId,
                );

                statusEffectsAPI.RemoveStatus(ownerId, "WeaponClick");

                ability._janitor.Remove(`M1_${currentClick}_Hitbox`);
                ability._janitor.Remove(`M1_${currentClick}_Hitbox_Destroy`);
                hitboxAPI.Destroy(`${ownerId}_M1_${currentClick}_Hitbox`);

                combatAnimator.StopAnimation(`M1`, 0, true, true);

                entity.SetState("LastLaunchedVFX", [
                    "Sekiro",
                    "Destroy_M1",
                    ownerId,
                    character,
                    currentClick,
                ]);

                if (Players.GetPlayerFromCharacter(character)) {
                    ServerSignals.Ability.fire(
                        Players.GetPlayerFromCharacter(character)!,
                        "Sekiro_M1",
                        "Switch",
                        "Interrupt",
                        false,
                        currentClick,
                    );
                } else {
                    ServerSignals.LaunchVFX.broadcast(
                        "Sekiro",
                        "Destroy_Basic_M1",
                        ownerId,
                        character,
                        currentClick,
                    );
                }
            },
        },
    );

    return ability;
}
