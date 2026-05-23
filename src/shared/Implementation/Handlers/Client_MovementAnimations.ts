import { ReplicatedStorage, Players, RunService } from "@rbxts/services";
import { Controller, Dependency, OnStart } from "@flamework/core";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { Janitor } from "@rbxts/janitor";
import type { MotionState } from "shared/Domain/Motion/Types/MotionTypes";

let sharedScope = CompositionRootShared.createScope();

const MOVEMENT_STATE_MAP = new Map<string, string>([
    ["Forward", "Walk"],
    ["Backward", "Walk"],
    ["Left", "Walk"],
    ["Right", "Walk"],
    ["ForwardLeft", "Walk"],
    ["ForwardRight", "Walk"],
    ["BackwardLeft", "Walk"],
    ["BackwardRight", "Walk"],
]);

const RUN_SPEED_THRESHOLD = 15;

@Controller()
export class Client_MovementAnimations implements OnStart {
    public player = Players.LocalPlayer;
    public playerStringUserId = tostring(this.player.UserId);
    public animationsPack = "Default";

    public enableAnimations = true as boolean;

    public replicatedStatusEffectsAPI = sharedScope.resolve(
        SharedRegistry.Singletons.API.ReplicatedStatusEffectsAPI,
    );

    private _janitor = new Janitor<any>();
    private _characterJanitor = new Janitor<any>();

    public api = {
        eventBusAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI),
        animationsAPI: sharedScope.resolve(SharedRegistry.Singletons.API.AnimationsAPI),
        motionAPI: sharedScope.resolve(SharedRegistry.Singletons.API.MotionAPI),
    };

    public buses = {
        playerBus: this.api.eventBusAPI.New(this.playerStringUserId, "Player"),
    };

    onStart(): void {
        this._janitor.Add(
            task.spawn(() => {
                this.buses.playerBus.Subscribe(
                    "CharacterLoaded",
                    (character: Model) => {
                        this._characterJanitor.Cleanup();
                        this.initAnimations(character);
                    },
                    undefined,
                    "MovementAnimationsInit",
                );
            }),
            true,
            "MovementAnimationsInitOnStart",
        );

        this._janitor.Add(
            task.spawn(() => {
                this.buses.playerBus.Subscribe(
                    "ChangeAnimationsPack",
                    (character: Model, _packName: string) => {
                        this.animationsPack = _packName;
                        this.initAnimations(character);
                    },
                    undefined,
                    "ChangeAnimationsPack",
                );
            }),
            true,
            "ChangeAnimationsPackOnStart",
        );

        this._janitor.Add(
            task.spawn(() => {
                this.buses.playerBus.Subscribe(
                    "SwitchDefaultAnimationsVisible",
                    (state: boolean) => {
                        this.enableAnimations = state;
                    },
                    undefined,
                    "SwitchDefaultAnimationsVisible",
                );
            }),
            true,
            "SwitchDefaultAnimationsVisible",
        );
    }

    private resolveMovementState(motionState: MotionState, walkSpeed: number): string {
        if (motionState.IsJumping) return "Jump";
        if (motionState.IsFalling) return "Falling";

        if (motionState.IsMoving) {
            const combinedTag = motionState.Direction3DTags.join("");
            const resolved = MOVEMENT_STATE_MAP.get(combinedTag);

            if (resolved) {
                return motionState.Speed >= RUN_SPEED_THRESHOLD ? "Run" : resolved;
            }
        }

        return "Idle";
    }

    private initAnimations(character: Model) {
        const humanoid = character.WaitForChild("Humanoid") as Humanoid;
        const humanoidRootPart = character.WaitForChild("HumanoidRootPart") as BasePart;

        this.StopAnimations(character);

        const motion = this.api.motionAPI.CreateMotion(
            { RootPart: humanoidRootPart, Humanoid: humanoid },
            this.playerStringUserId,
            "Motion",
        );

        const animationsPack = ReplicatedStorage.WaitForChild("Assets")
            .WaitForChild("Animations")
            .WaitForChild(this.animationsPack) as Folder;

        const animator = this.api.animationsAPI.CreateAnimator(
            { Character: character },
            "Default_Animator",
            this.playerStringUserId,
        );

        let currentAnimation: string | undefined;
        let jumpLocked = false;

        const playState = (state: string) => {
            const animationName = `Movement_${state}`;

            if (currentAnimation === animationName) return;
            currentAnimation = animationName;

            animator.StopAnimation("Movement", 0.2, true, true, [animationName]);

            const isJump = state === "Jump";

            let animation = animationsPack.WaitForChild(state) as Animation;

            let anim = animator.PlayAnimation(
                animation,
                animationName,
                false,
                Enum.AnimationPriority.Movement,
                !isJump,
                undefined,
                undefined,
                undefined,
                isJump
                    ? () => {
                          jumpLocked = false;
                          currentAnimation = undefined;
                      }
                    : undefined,
            );

            if (isJump) jumpLocked = true;
        };

        this._characterJanitor.Add(
            humanoid.Died.Connect(() => {
                this.StopAnimations(character);
            }),
            "Disconnect",
            "Death",
        );

        this._characterJanitor.Add(
            RunService.Heartbeat.Connect(() => {
                if (jumpLocked) return;

                const motionState = motion.GetState();
                const state = this.resolveMovementState(motionState, humanoid.WalkSpeed);

                if (this.enableAnimations) {
                    playState(state);
                } else {
                    animator.StopAnimation("Movement", 0, true, true);
                }

                playState(state);
            }),
            "Disconnect",
        );
    }

    private StopAnimations(charater: Model) {
        this.api.animationsAPI.RemoveActorAnimator(
            this.playerStringUserId,
            "Default_Animator",
            true,
            false,
        );
        this.api.motionAPI.RemoveActorMotion(this.playerStringUserId, "Motion");
        this._characterJanitor.Cleanup();
    }

    private StopAnimationsSafe(charater: Model) {
        this.api.animationsAPI.RemoveActorAnimator(
            this.playerStringUserId,
            "Default_Animator",
            true,
            false,
        );
        this.api.motionAPI.RemoveActorMotion(this.playerStringUserId, "Motion");
    }
}
