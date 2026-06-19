import { RunService, Workspace, ReplicatedStorage } from "@rbxts/services";

import { ClientSignals } from "../../ClientSignals";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import TweenMath from "shared/Utilities/TweenMath";
import { IAnimations } from "shared/Types/Assets/Animations";
import { AllSoundPaths, SoundsUtil } from "shared/Utilities/SoundsUtil";
import { VFXModules } from "../../VFXs";
import { PingUitl } from "shared/Utilities/PingUtil";
import { TableHelper } from "shared/Utilities/TableHelper";

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

export function Dash(ownerId: string) {
    const DASH_DURATION = 0.5;
    const DASH_FADE_TIME = 0.15;
    const DASH_WAIT_FADE_TIME = 0.35;
    let dashSpeed = 50;
    let dodgeSpeed = 55;
    let finalDashSpeed = 15;
    let lastCFrame = undefined as CFrame | undefined;

    let sideDashSpeed = 1;
    let forwardDashSpeed = 1;

    const DIRECTION_VECTORS: Record<string, Vector3> = {
        Idle: new Vector3(0, 0, -forwardDashSpeed),
        Forward: new Vector3(0, 0, -forwardDashSpeed),
        Backward: new Vector3(0, 0, forwardDashSpeed),
        Left: new Vector3(-sideDashSpeed, 0, 0),
        Right: new Vector3(sideDashSpeed, 0, 0),

        ForwardLeft: new Vector3(-sideDashSpeed, 0, -forwardDashSpeed).Unit,
        ForwardRight: new Vector3(sideDashSpeed, 0, -forwardDashSpeed).Unit,
        BackwardLeft: new Vector3(-sideDashSpeed, 0, forwardDashSpeed).Unit,
        BackwardRight: new Vector3(sideDashSpeed, 0, forwardDashSpeed).Unit,
    };

    const ANIM_NAMES: Record<string, string> = {
        Idle: "Dash_Forward",
        Forward: "Dash_Forward",
        Backward: "Dash_Back",
        Left: "Dash_Left",
        Right: "Dash_Right",

        ForwardLeft: "Dash_Forward",
        ForwardRight: "Dash_Forward",
        BackwardLeft: "Dash_Back",
        BackwardRight: "Dash_Back",
    };

    let defaultVFX = VFXModules.Default();

    let forwardDashRight = true;
    let backDashRight = true;

    const Interrupt = () => {
        if (TableHelper.IsTableEmpty(ability)) {
            return;
        }

        let entity = entitiesStorageAPI.GetEntity(ownerId)!;
        let character = entity.entity as Model;
        let humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
        let animator = animationsAPI.CreateAnimator(
            { Character: character },
            "MovementAnimator",
            ownerId,
        );

        if (lastCFrame && Workspace.GetServerTimeNow() - ability.config.lastUsed <= 0.35) {
            humanoidRootPart.CFrame = lastCFrame;
        }

        replicatedStatusEffectsAPI.Unsubscribe(ownerId, "Dash_Statuses");
        ability._janitor.Remove("VelocityUpdate");
        assetsHelperAPI.DestroyAsset("Dash_LV");
        ability._janitor.Remove("RemoveLV");
        animator.StopAnimation("Dash", 0, true, true);
        defaultVFX.Dash_Interrupt(character, ownerId);
    };

    let ability = abilityAPI.Create(
        {
            name: "Default_Dash",
            ownerId,
            states: ["Idle"],
            lastUsed: 0,
            types: [{ name: "Movement", level: 1 }],
            additionalBlacklist: ["WeaponClick", "Block"],
            cooldown: 2,
            duration: DASH_DURATION,
            minDuration: DASH_DURATION,
        },
        {
            onStartCheck() {
                if (
                    replicatedStatusEffectsAPI.CheckClientStatuses(
                        ownerId,
                        ability.GetBlacklist(),
                        ability.config.ignoreList ?? [],
                    )
                ) {
                    return false;
                }

                if (
                    replicatedStatusEffectsAPI.CheckReplicatedStatuses(
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
                let humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;
                let animator = animationsAPI.CreateAnimator(
                    { Character: character },
                    "MovementAnimator",
                    ownerId,
                );

                lastCFrame = humanoidRootPart.CFrame;

                replicatedStatusEffectsAPI.CreateStatus(
                    ownerId,
                    { id: "Dash_Cast", duration: 0.15 },
                    true,
                );

                replicatedStatusEffectsAPI.CreateStatus(
                    ownerId,
                    { id: "Dash", duration: 0.5 },
                    true,
                );

                let dash_LV = assetsHelperAPI.LinearVelocity({
                    Name: "Dash_LV",
                    Parent: humanoidRootPart,
                });

                dash_LV.instance.RelativeTo = Enum.ActuatorRelativeTo.World;
                dash_LV.instance.VelocityConstraintMode = Enum.VelocityConstraintMode.Vector;
                dash_LV.instance.ForceLimitMode = Enum.ForceLimitMode.PerAxis;
                dash_LV.instance.MaxAxesForce = new Vector3(20000, 0, 20000);
                dash_LV.instance.Attachment0 = humanoidRootPart.WaitForChild(
                    "RootAttachment",
                ) as Attachment;

                let motion = motionAPI.CreateMotion(
                    { RootPart: humanoidRootPart },
                    ownerId,
                    "Motion",
                );

                const direction2d = motion.GetDirection2D();
                const localDir = DIRECTION_VECTORS[direction2d] ?? new Vector3(0, 0, -1);

                ClientSignals.Ability.fire(
                    "Default_Dash",
                    "Swtich",
                    "Start",
                    ANIM_NAMES[direction2d],
                );

                let elapsed = 0;

                let animName = "";
                let prefix = "";

                if (ANIM_NAMES[direction2d] === "Dash_Forward") {
                    prefix = forwardDashRight ? "_Right" : "_Left";
                    forwardDashRight = !forwardDashRight;
                } else if (ANIM_NAMES[direction2d] === "Dash_Back") {
                    prefix = backDashRight ? "_Right" : "_Left";
                    backDashRight = !backDashRight;
                }

                animName = `${ANIM_NAMES[direction2d]}${prefix}`;
                let characterName = entity.GetState(`CharacterName`)! as string;
                let lastAction = (character.GetAttribute(`EquippedWeapon`) as boolean) ?? false;
                let dashsPackWord = lastAction ? "Unsheath" : "Sheath";

                let anim = animator.PlayAnimation(
                    Animations.FindFirstChild(characterName)!
                        .FindFirstChild("Dashes")!
                        .FindFirstChild(dashsPackWord)!
                        .FindFirstChild(animName) as Animation,
                    ANIM_NAMES[direction2d],
                    true,
                    Enum.AnimationPriority.Action,
                    false,
                );

                defaultVFX.Dash_Emit(character, ownerId);

                replicatedStatusEffectsAPI.Subscribe(
                    ownerId,
                    [
                        { status: "Stun", event: "Added" },
                        { status: "Dead", event: "Added" },
                        { status: "Knocked", event: "Added" },
                        { status: "Dash_Fient", event: "Added" },
                    ],
                    (event, status) => {
                        Interrupt();
                    },
                    "Dash_Statuses",
                );

                ability._janitor.Add(
                    RunService.Heartbeat.Connect((dt: number) => {
                        elapsed += dt;

                        const fadeElapsed = math.max(0, elapsed - DASH_WAIT_FADE_TIME);
                        const alpha = math.clamp(fadeElapsed / DASH_FADE_TIME, 0, 1);

                        let currentSpeed = TweenMath.Lerp(
                            dashSpeed,
                            finalDashSpeed,
                            alpha,
                            "Linear",
                            "In",
                        );

                        if (replicatedStatusEffectsAPI.HasReplicatedStatus(ownerId, `Dodged`)) {
                            let statusEffect = replicatedStatusEffectsAPI.GetReplicatedStatus(
                                ownerId,
                                `Dodged`,
                            )!;
                            currentSpeed = dodgeSpeed;

                            ability._janitor.Remove(`RemoveLV`);

                            ability._janitor.Add(
                                task.delay(
                                    statusEffect.spawned +
                                        statusEffect.duration +
                                        0.15 -
                                        Workspace.GetServerTimeNow(),
                                    () => {
                                        assetsHelperAPI.DestroyAsset("Dash_LV");
                                        ability._janitor.Remove("VelocityUpdate");
                                    },
                                ),
                                true,
                                "RemoveLV",
                            );
                        }

                        const worldDir = humanoidRootPart.CFrame.VectorToWorldSpace(localDir);
                        dash_LV.instance.VectorVelocity = worldDir.mul(currentSpeed);
                    }),
                    "Disconnect",
                    "VelocityUpdate",
                );

                ability._janitor.Add(
                    task.delay(DASH_DURATION, () => {
                        assetsHelperAPI.DestroyAsset("Dash_LV");
                        ability._janitor.Remove("VelocityUpdate");
                    }),
                    true,
                    "RemoveLV",
                );
            },
            onEnd() {
                lastCFrame = undefined;
            },
            onInterrupt() {
                Interrupt();
            },
            onReject(serverReject?: boolean) {
                if (serverReject === true) {
                    Interrupt();
                }
            },
        },
    );

    return ability;
}
