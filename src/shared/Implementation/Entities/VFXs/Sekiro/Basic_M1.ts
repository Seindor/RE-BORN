import { ReplicatedStorage, Workspace } from "@rbxts/services";

import { Sekiro } from "../Sekiro";

import { Controller } from "@flamework/core";
import { AllSoundPaths, SoundsUtil } from "shared/Utilities/SoundsUtil";
import { ParseRobloxAliasPath } from "shared/Utilities/GetObjectFromPath";
import { ParticleDirection } from "shared/Utilities/ParticleDirection";

import { IModels } from "shared/Types/Assets/Models";
import { IAnimations } from "shared/Types/Assets/Animations";
import { IApperancy } from "shared/Types/Gameplay/PlayerApperance";
import { Sekiro_Basic_M1_Timings } from "./Types/Basic_M1_Timings";
import { AnimationsPriorities } from "shared/Types/Gameplay/AnimationTypes";
import { ISekiroAnimations, ISekiroVFXs } from "./types";
import { emit } from "@zilibobi/forge-vfx";

const Assets = ReplicatedStorage.WaitForChild("Assets");
const Models = Assets.WaitForChild("Models") as IModels;
const Animations = Assets.WaitForChild("Animations") as IAnimations;
const VFXs = Assets.WaitForChild("VFXs") as Folder;

const SekiroAnimations = Animations.WaitForChild("Sekiro") as ISekiroAnimations;
const SekiroVFXs = VFXs.WaitForChild("Sekiro") as ISekiroVFXs;

@Controller()
export class Basic_M1 {
    private main: Sekiro;

    constructor(_main: Sekiro) {
        this.main = _main;
    }

    private createSwingSoundVFX(ownerId: string, katana: MeshPart, currentClick: number) {
        let janitor = this.main.GetJanitor(ownerId);

        const sound = SoundsUtil.CreateSound(`Sekiro/Swings/${currentClick}` as AllSoundPaths);
        sound.Parent = katana;
        SoundsUtil.PlaySound(sound, true);

        janitor.Add(sound, "Destroy", `Swing_Sound_${currentClick}`);
    }

    private createSwingVFX(
        character: Model,
        katana: MeshPart,
        currentClick: number,
        ownerId: string,
    ) {
        let janitor = this.main.GetJanitor(ownerId);

        if (currentClick === 4) {
            let rightLeg = character.WaitForChild("Right Leg") as BasePart;

            const trail = SekiroVFXs.FindFirstChild("M1")!
                .FindFirstChild("Leg_Trail")!
                .Clone() as BasePart;

            let weld = new Instance("Weld");

            weld.Part0 = rightLeg;
            weld.Part1 = trail;

            weld.C1 = new CFrame(0, 1.025, 0);

            weld.Parent = Workspace.WaitForChild("Map").WaitForChild("Debris");
            trail.Parent = Workspace.WaitForChild("Map").WaitForChild("Debris");

            janitor.Add(trail, "Destroy", `Leg_Trail`);
            janitor.Add(weld, "Destroy", `Leg_Trail_Weld`);
        } else {
            const at1 = (SekiroVFXs.M1.FindFirstChild("1") as Attachment).Clone();
            const at2 = (SekiroVFXs.M1.FindFirstChild("2") as Attachment).Clone();
            const at3 = (SekiroVFXs.M1.FindFirstChild("3") as Attachment).Clone();
            const smooth = (SekiroVFXs.M1.FindFirstChild("Smooth") as Trail).Clone();
            const wind = (SekiroVFXs.M1.FindFirstChild("wind") as Trail).Clone();

            at1.Parent = katana;
            at2.Parent = katana;
            at3.Parent = katana;
            smooth.Parent = katana;
            wind.Parent = katana;

            smooth.Attachment0 = at2;
            smooth.Attachment1 = at1;
            wind.Attachment0 = at1;
            wind.Attachment1 = at3;
            smooth.Enabled = true;
            wind.Enabled = true;

            janitor.Add(at1, "Destroy", `at1`);
            janitor.Add(at2, "Destroy", `at2`);
            janitor.Add(at3, "Destroy", `at3`);
            janitor.Add(smooth, "Destroy", `smooth`);
            janitor.Add(wind, "Destroy", `wind`);
        }
    }

    private removeSwingVFX(ownerId: string) {
        let janitor = this.main.GetJanitor(ownerId);

        janitor.Remove(`at1`);
        janitor.Remove(`at2`);
        janitor.Remove(`at3`);
        janitor.Remove(`smooth`);
        janitor.Remove(`wind`);

        let legTrail = janitor.Get(`Leg_Trail`) as BasePart;
        if (legTrail) {
            let trail = legTrail.FindFirstChild("Trail")! as Trail;
            trail.Enabled = false;

            task.delay(3, () => {
                janitor.Remove(`Leg_Trail`);
                janitor.Remove(`Leg_Trail_Weld`);
            });
        }
    }

    private destroySwingVFX(ownerId: string, currentClick: number) {
        let janitor = this.main.GetJanitor(ownerId);

        janitor.Remove(`at1`);
        janitor.Remove(`at2`);
        janitor.Remove(`at3`);
        janitor.Remove(`smooth`);
        janitor.Remove(`wind`);

        janitor.Remove(`Swing_Sound_1`);
        janitor.Remove(`Swing_Sound_2`);
        janitor.Remove(`Swing_Sound_3`);
        janitor.Remove(`Swing_Sound_4`);

        let legTrail = janitor.Get(`Leg_Trail`) as BasePart;
        if (legTrail) {
            let trail = legTrail.FindFirstChild("Trail")! as Trail;
            trail.Enabled = false;

            task.delay(3, () => {
                janitor.Remove(`Leg_Trail`);
                janitor.Remove(`Leg_Trail_Weld`);
            });
        }
    }

    private createHitVFX(ownerId: string, character: Model, currentClick: number, hitTime: number) {
        let janitor = this.main.GetJanitor(ownerId);

        let torso = character.WaitForChild("Torso")! as BasePart;
        janitor.Add(
            task.spawn(() => {
                if (currentClick === 4) {
                    let hitVFX = VFXs.FindFirstChild("Default")!
                        .FindFirstChild("Hit")!
                        .Clone() as BasePart;
                    let hitSound = SoundsUtil.CreateSound("Default/Hits/1");

                    hitVFX.Parent = Workspace.WaitForChild("Map").WaitForChild("Debris");
                    hitSound.Parent = torso;

                    hitVFX.Position = torso.Position;

                    SoundsUtil.PlaySound(hitSound, true);
                    emit(hitVFX);

                    janitor.Add(hitSound, "Destroy", `HitSound`);
                    janitor.Add(hitVFX, "Destroy", `HitVFX`);

                    janitor.Add(
                        task.delay(3, () => {
                            janitor.Remove(`HitVFX`);
                            janitor.Remove(`HitSound`);
                            janitor.Remove(`Remove_HitVFX`);
                        }),
                        true,
                        `Remove_HitVFX`,
                    );
                } else {
                    let bloodHit = VFXs.FindFirstChild("Default")!
                        .FindFirstChild("BloodHit")!
                        .Clone() as BasePart;

                    let hitSound = SoundsUtil.CreateSound(
                        `Default/Sword_Blood_Hits/${currentClick}` as AllSoundPaths,
                    );

                    bloodHit.Anchored = true;

                    bloodHit.Parent = Workspace.WaitForChild("Map")!.WaitForChild("Debris");
                    hitSound.Parent = torso;

                    bloodHit.Position = torso.Position;

                    emit(bloodHit);
                    SoundsUtil.PlaySound(hitSound, true);

                    task.spawn(() => {
                        const emitCount =
                            (bloodHit
                                .FindFirstChild("At")!
                                .FindFirstChild("BloodyDrop")!
                                .GetAttribute("EmitCount") as number) ?? 1;

                        const max = math.max(1, math.ceil(emitCount / 3));
                        const amount = math.random(1, max);

                        for (let i = 1; i <= amount; i++) {
                            let groundBleed = VFXs.FindFirstChild("Default")!
                                .FindFirstChild(`BleedGround_${math.random(1, 2)}`)!
                                .Clone() as BasePart;

                            let bloodBulletTrail = VFXs.FindFirstChild("Default"!)
                                ?.FindFirstChild("BloodBulletTrail")!
                                .Clone() as BasePart;
                            bloodBulletTrail.Parent = Workspace.WaitForChild("Map")!.WaitForChild(
                                "Debris",
                            ) as Folder;

                            groundBleed.Parent = Workspace.WaitForChild("Map")!.WaitForChild(
                                "Debris",
                            ) as Folder;

                            task.delay(7, () => {
                                groundBleed.Destroy();
                                bloodBulletTrail.Destroy();
                            });

                            ParticleDirection.EmitOnImpact({
                                emitter: bloodHit
                                    .FindFirstChild("At")!
                                    .FindFirstChild("BloodyDrop")! as ParticleEmitter,
                                origin: torso.Position,
                                lookVector: torso.CFrame.LookVector,

                                delay: 0,

                                curve: {
                                    duration: math.random(25, 35) / 100,
                                    style: "Linear",
                                    direction: "In",
                                    maxArcHeight: math.random(1, 4),
                                },

                                particleToEmit: groundBleed,
                                trail: bloodBulletTrail,
                                directionOffset: new Vector3(
                                    math.random(1, 3),
                                    0,
                                    math.random(1, 3),
                                ),

                                ignore: [
                                    Workspace.WaitForChild("Map").WaitForChild("Players"),
                                    Workspace.WaitForChild("Map").WaitForChild("NPCs"),
                                ],
                            });
                        }
                    });

                    janitor.Add(bloodHit, "Destroy", `BloodHit_VFX`);
                    janitor.Add(hitSound, "Destroy", `Hit_Sound`);

                    janitor.Add(
                        task.delay(2, () => {
                            this.destroyHitVFX(ownerId);
                        }),
                        true,
                        `Hit_Destroy`,
                    );
                }
            }),
        );
    }

    private destroyHitVFX(ownerId: string) {
        let janitor = this.main.GetJanitor(ownerId);

        janitor.Remove(`BloodHit_VFX`);
        janitor.Remove(`Hit_VFX`);
        janitor.Remove(`Hit_Destroy`);
    }

    public Destroy_Basic_M1(ownerId: string, character: Model, currentClick: number) {
        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");
        const isLastAction = entity.miscData.get("LastAction") as boolean;
        const prefix = `${ownerId}_M1_${currentClick}`;

        this.main.LastActionUpdate(ownerId, character, isLastAction ?? true);

        combatAnimator.StopAnimation(`M1`, 0, true, true);
        this.destroySwingVFX(ownerId, currentClick);
    }

    public Basic_M1_Var2(
        ownerId: string,
        character: Model,
        currentClick: number,
        serverTime: number,
        ownerPing: number,
    ) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;

        const offsetTime = Workspace.GetServerTimeNow() - serverTime;
        const isLastAction = entity.miscData.get("LastAction") as boolean;

        this.main.LastActionUpdate(ownerId, character);

        const timingPackName = isLastAction ? "Equipped" : "Unequipped";
        const timing =
            Sekiro_Basic_M1_Timings[timingPackName as keyof typeof Sekiro_Basic_M1_Timings][
                `M1_${currentClick}` as keyof typeof Sekiro_Basic_M1_Timings.Unequipped
            ];

        const animator = this.main.GetAnimator(character, ownerId, "CombatAnimator");
        const animToPlay = SekiroAnimations.Combat.FindFirstChild("Sheath_M1")!.FindFirstChild(
            `M1_${currentClick}`,
        ) as Animation;

        let animation: AnimationTrack | undefined;

        if (character.HasTag("NPC") || this.main.IsLocalCharacter(character)) {
            if (this.main.IsLocalCharacter(character)) {
                this.main.api.eventBusAPI
                    .New(ownerId, "Player")
                    .Fire(
                        "ChangeAnimationsPack",
                        undefined,
                        true,
                        character,
                        `shared.Assets.Animations.Sekiro.Movement.Unsheath`,
                    );
            }

            this.main.StopKatanaSheathAnim(ownerId, character, true);

            animation = animator.PlayAnimation(
                animToPlay,
                `M1_${currentClick}`,
                false,
                AnimationsPriorities.CombatAnimation,
                false,
                0.15,
            );
        } else {
            while (!animation) {
                for (const track of animator.animator.GetPlayingAnimationTracks()) {
                    if (track.Animation?.AnimationId === animToPlay.AnimationId) {
                        animation = track;
                        animation.TimePosition = math.clamp(offsetTime, 0, animation.Length);
                    }
                }
                task.wait();
            }
        }

        while (animation.Length <= 0) task.wait();

        janitor.Remove(`animation_Check`);

        if (offsetTime >= timing.events.swingreg) {
            this.createSwingVFX(character, katana, currentClick, ownerId);
        } else {
            animation.GetMarkerReachedSignal("swingreg").Once(() => {
                this.createSwingVFX(character, katana, currentClick, ownerId);
            });
        }

        if (offsetTime >= timing.events.swingend) {
            this.removeSwingVFX(ownerId);
        } else {
            animation.GetMarkerReachedSignal("swingend").Once(() => {
                this.removeSwingVFX(ownerId);
            });
        }

        if (offsetTime >= 0.333) {
            this.main.Equip(ownerId, character);
        } else {
            animation.GetMarkerReachedSignal("unsheath").Once(() => {
                this.main.Equip(ownerId, character);
            });
        }

        animation.GetMarkerReachedSignal("sheath").Once(() => {
            this.main.FastUnequip(ownerId, character);
        });

        task.delay(timing.duration - offsetTime, () => {
            janitor.Remove(`animation_Check`);
        });
    }

    public Basic_M1(
        ownerId: string,
        character: Model,
        currentClick: number,
        serverTime: number,
        ownerPing: number,
    ) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;

        const offsetTime = Workspace.GetServerTimeNow() - serverTime;
        const isLastAction = entity.miscData.get("LastAction") as boolean;

        this.main.LastActionUpdate(ownerId, character, isLastAction || true, true);

        const timingPackName = isLastAction ? "Equipped" : "Unequipped";
        const timing =
            Sekiro_Basic_M1_Timings[timingPackName as keyof typeof Sekiro_Basic_M1_Timings][
                `M1_${currentClick}` as keyof typeof Sekiro_Basic_M1_Timings.Unequipped
            ];

        const animator = this.main.GetAnimator(character, ownerId, "CombatAnimator");
        const animToPlay = SekiroAnimations.Combat.FindFirstChild(
            isLastAction ? "Unsheath_M1" : "Sheath_M1",
        )!.FindFirstChild(`M1_${currentClick}`) as Animation;

        let animation: AnimationTrack | undefined;

        if (character.HasTag("NPC") || this.main.IsLocalCharacter(character)) {
            if (this.main.IsLocalCharacter(character)) {
                this.main.api.eventBusAPI
                    .New(ownerId, "Player")
                    .Fire(
                        "ChangeAnimationsPack",
                        undefined,
                        true,
                        character,
                        `shared.Assets.Animations.Sekiro.Movement.Unsheath`,
                    );
            }

            this.main.StopKatanaSheathAnim(ownerId, character, true);

            animation = animator.PlayAnimation(
                animToPlay,
                `M1_${currentClick}`,
                false,
                AnimationsPriorities.CombatAnimation,
                false,
                0.15,
            );
        } else {
            while (!animation) {
                for (const track of animator.animator.GetPlayingAnimationTracks()) {
                    if (track.Animation?.AnimationId === animToPlay.AnimationId) {
                        animation = track;
                        animation.TimePosition = math.clamp(offsetTime, 0, animation.Length);
                    }
                }
                task.wait();
            }
        }

        while (animation.Length <= 0) task.wait();

        janitor.Remove(`animation_Check`);

        if (offsetTime >= timing.events.swingsound) {
            this.createSwingSoundVFX(ownerId, katana, currentClick);
        } else {
            animation.GetMarkerReachedSignal("swingsound").Once(() => {
                this.createSwingSoundVFX(ownerId, katana, currentClick);
            });
        }

        if (offsetTime >= timing.events.swingreg) {
            this.createSwingVFX(character, katana, currentClick, ownerId);
        } else {
            animation.GetMarkerReachedSignal("swingreg").Once(() => {
                this.createSwingVFX(character, katana, currentClick, ownerId);
            });
        }

        if (offsetTime >= timing.events.swingend) {
            this.removeSwingVFX(ownerId);
        } else {
            animation.GetMarkerReachedSignal("swingend").Once(() => {
                this.removeSwingVFX(ownerId);
            });
        }

        if (offsetTime >= 0.333) {
            this.main.Equip(ownerId, character);
        } else {
            animation.GetMarkerReachedSignal("unsheath").Once(() => {
                this.main.Equip(ownerId, character);
            });
        }

        animation.GetMarkerReachedSignal("sheath").Once(() => {
            this.main.FastUnequip(ownerId, character);
        });

        if (animation.Name === "M1_4") {
            this.main.LastActionUpdate(ownerId, character, true, true);
        }

        task.delay(timing.duration - offsetTime, () => {
            janitor.Remove(`animation_Check`);
        });
    }

    public Hit(ownerId: string, character: Model, currentClick: number, serverTime: number) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;
        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");

        const offsetTime = Workspace.GetServerTimeNow() - serverTime;

        let lastAction = (entity.miscData.get("LastAction") as boolean) ?? false;

        if (janitor.Get("LastActionCheck")) {
            this.main.LastActionUpdate(ownerId, character, lastAction, true);
        }

        if (!this.main.Debris.has(`${ownerId}_Hit`)) {
            this.main.Debris.set(`${ownerId}_Hit`, 1);
        }

        let hitTime = this.main.Debris.get(`${ownerId}_Hit`)! as number;

        let animToPlay = ParseRobloxAliasPath(
            `shared.Assets.Animations.Sekiro.Combat.Hits.Hit_${hitTime}`,
        ) as Animation;
        let animation = undefined as AnimationTrack | undefined;

        animation = combatAnimator.PlayAnimation(
            animToPlay,
            `Sekiro_Hit_${hitTime}`,
            true,
            AnimationsPriorities.CombatAnimation,
            false,
            0,
        );

        this.createHitVFX(ownerId, character, currentClick, hitTime);

        if (!this.main.IsLocalCharacter(character)) {
            janitor.Add(
                combatAnimator.animator.AnimationPlayed.Connect(
                    (animationTrack: AnimationTrack) => {
                        if (animationTrack.Animation?.AnimationId === animToPlay.AnimationId) {
                            animationTrack.Stop();
                            janitor.Remove(`Stop_Hit_Animation`);
                        }
                    },
                ),
                "Disconnect",
                `Stop_Hit_Animation`,
            );
        }

        if (hitTime >= 3) {
            this.main.Debris.set(`${ownerId}_Hit`, 1);
        } else {
            this.main.Debris.set(`${ownerId}_Hit`, hitTime + 1);
        }
    }
}
