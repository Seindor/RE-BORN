import { ReplicatedStorage, Workspace, TweenService } from "@rbxts/services";

import { Sekiro } from ".";

import { Controller } from "@flamework/core";

import { AllSoundPaths, SoundsUtil } from "shared/Utilities/SoundsUtil";
import { ParseRobloxAliasPath } from "shared/Utilities/GetObjectFromPath";
import { emit } from "@zilibobi/forge-vfx";

import { IModels } from "shared/Types/Assets/Models";
import { IAnimations } from "shared/Types/Assets/Animations";
import { IApperancy } from "shared/Types/Gameplay/PlayerApperance";
import { AnimationsPriorities } from "shared/Types/Gameplay/AnimationTypes";
import { ISekiroAnimations, ISekiroVFXs } from "./types";

const Assets = ReplicatedStorage.WaitForChild("Assets");
const Models = Assets.WaitForChild("Models") as IModels;
const Animations = Assets.WaitForChild("Animations") as IAnimations;
const VFXs = Assets.WaitForChild("VFXs") as Folder;

const SekiroAnimations = Animations.WaitForChild("Sekiro") as ISekiroAnimations;
const DefaultVFXs = VFXs.WaitForChild(`Default`) as Folder;
const SekiroVFXs = VFXs.WaitForChild("Sekiro") as ISekiroVFXs;

@Controller()
export class Basic_Parry {
    private main: Sekiro;

    constructor(_main: Sekiro) {
        this.main = _main;
    }

    private createParriedEffect(ownerId: string, character: Model, parryCount: number) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;

        let parryEffect = DefaultVFXs.WaitForChild(`Parry`).Clone() as BasePart;
        let parrySound = SoundsUtil.CreateSound(`Default/Parried/${parryCount}` as AllSoundPaths);

        parryEffect.Anchored = true;

        parryEffect.CFrame = katana.CFrame;

        parryEffect.Parent = Workspace.WaitForChild(`Map`).WaitForChild(`Debris`);
        parrySound.Parent = parryEffect;

        SoundsUtil.PlaySound(parrySound, true);
        emit(parryEffect);

        task.delay(0.2, () => {
            let pointLight = parryEffect.FindFirstChild(`PointLight`)! as PointLight;

            TweenService.Create(pointLight, new TweenInfo(0.15, Enum.EasingStyle.Linear), {
                Brightness: 0,
            }).Play();

            task.wait(0.8);

            parryEffect.Destroy();
        });
    }

    public Parry_Cast(ownerId: string, character: Model, serverTime: number) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;

        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");

        const animToPlay = SekiroAnimations.Defense.FindFirstChild(`Parry_Cast`)! as Animation;

        this.main.Equip(ownerId, character);
        //this.main.LastActionUpdate(ownerId, character, true, false);

        for (const track of combatAnimator.animator.GetPlayingAnimationTracks()) {
            if (track.Animation?.AnimationId === animToPlay.AnimationId) {
                track.Stop(0);
            }
        }

        let animation = undefined as AnimationTrack | undefined;

        animation = combatAnimator.PlayAnimation(
            animToPlay,
            `Sekiro_Parry_Cast`,
            true,
            AnimationsPriorities.DefenseAnimations,
            false,
            0.1,
        );

        if (!this.main.IsLocalCharacter(character)) {
            janitor.Add(
                combatAnimator.animator.AnimationPlayed.Connect(
                    (animationTrack: AnimationTrack) => {
                        if (animationTrack.Animation?.AnimationId === animToPlay.AnimationId) {
                            animationTrack.Stop();
                            janitor.Remove(`Stop_Parry_Cast_Animation`);
                        }
                    },
                ),
                "Disconnect",
                `Stop_Parry_Cast_Animation`,
            );
        }
    }

    public WasParried(ownerId: string, character: Model, serverTime: number) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);

        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");

        //this.main.LastActionUpdate(ownerId, character, true, true);
        this.main.Equip(ownerId, character, false);

        if (!this.main.Debris.has(`${ownerId}_LastParriedCount`)) {
            this.main.Debris.set(`${ownerId}_LastParriedCount`, 1);
        }

        let lastParriedCount = this.main.Debris.get(`${ownerId}_LastParriedCount`)! as number;

        if (lastParriedCount >= 2) {
            this.main.Debris.set(`${ownerId}_LastParriedCount`, 1);
        } else {
            this.main.Debris.set(`${ownerId}_LastParriedCount`, lastParriedCount + 1);
        }

        const animToPlay = SekiroAnimations.Combat.Hits.FindFirstChild(
            `Parried_${lastParriedCount}`,
        )! as Animation;

        combatAnimator.PlayAnimation(
            animToPlay,
            `Parried_${lastParriedCount}`,
            true,
            AnimationsPriorities.DefenseAnimations,
            false,
            0,
        );

        if (!this.main.IsLocalCharacter(character)) {
            janitor.Add(
                combatAnimator.animator.AnimationPlayed.Connect(
                    (animationTrack: AnimationTrack) => {
                        if (animationTrack.Animation?.AnimationId === animToPlay.AnimationId) {
                            animationTrack.Stop();
                            janitor.Remove(`Stop_Parried_Animation`);
                        }
                    },
                ),
                "Disconnect",
                `Stop_Parried_Animation`,
            );
        }
    }

    public Parried(ownerId: string, character: Model, serverTime: number) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);

        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");

        this.main.Equip(ownerId, character, false);
        //this.main.LastActionUpdate(ownerId, character, true, true);

        if (!this.main.Debris.has(`${ownerId}_LastParryCount`)) {
            this.main.Debris.set(`${ownerId}_LastParryCount`, 1);
        }

        let lastParryCount = this.main.Debris.get(`${ownerId}_LastParryCount`)! as number;

        if (lastParryCount >= 3) {
            this.main.Debris.set(`${ownerId}_LastParryCount`, 1);
        } else {
            this.main.Debris.set(`${ownerId}_LastParryCount`, lastParryCount + 1);
        }

        const animToPlay = SekiroAnimations.Defense.FindFirstChild(
            `Parry_${lastParryCount}`,
        )! as Animation;

        combatAnimator.PlayAnimation(
            animToPlay,
            `Parry_${lastParryCount}`,
            true,
            AnimationsPriorities.DefenseAnimations,
            false,
            0,
        );

        if (!this.main.IsLocalCharacter(character)) {
            janitor.Add(
                combatAnimator.animator.AnimationPlayed.Connect(
                    (animationTrack: AnimationTrack) => {
                        if (animationTrack.Animation?.AnimationId === animToPlay.AnimationId) {
                            animationTrack.Stop();
                            janitor.Remove(`Stop_Parry_Animation`);
                        }
                    },
                ),
                "Disconnect",
                `Stop_Parry_Animation`,
            );
        }

        this.createParriedEffect(ownerId, character, lastParryCount);
    }
}
