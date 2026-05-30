import { ReplicatedStorage, Workspace } from "@rbxts/services";

import { Sekiro } from "../Sekiro";

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
const SekiroVFXs = VFXs.WaitForChild("Sekiro") as ISekiroVFXs;

@Controller()
export class Basic_Block {
    private main: Sekiro;

    constructor(_main: Sekiro) {
        this.main = _main;
    }

    private createBlockHitVFX(
        ownerId: string,
        character: Model,
        katana: MeshPart,
        hitCount: number,
    ) {
        let janitor = this.main.GetJanitor(ownerId);

        let swordBlockHit = VFXs.FindFirstChild("Default")!
            .FindFirstChild("Sword_BlockHit")!
            .Clone() as BasePart;
        let swordBlockHitSound = SoundsUtil.CreateSound(
            `Default/Sword_BlockHits/${hitCount}` as AllSoundPaths,
        );

        swordBlockHit.Parent = Workspace.WaitForChild("Map")!.WaitForChild("Debris") as Folder;
        swordBlockHitSound.Parent = katana;

        swordBlockHit.Anchored = true;
        swordBlockHit.Position = katana.Position;

        emit(swordBlockHit);
        SoundsUtil.PlaySound(swordBlockHitSound, true);

        janitor.Add(swordBlockHit, "Destroy", `SwordBlockHit_Effect`);
        janitor.Add(swordBlockHitSound, "Destroy", `SwordBlockHit_Sound`);

        janitor.Add(
            task.delay(2, () => {
                this.removeBlockHitVFX(ownerId);
            }),
            true,
            `SwordBlockHit_Destroy`,
        );
    }

    private removeBlockHitVFX(ownerId: string) {
        let janitor = this.main.GetJanitor(ownerId);

        janitor.Remove(`SwordBlockHit_Effect`);
        janitor.Remove(`SwordBlockHit_Sound`);
        janitor.Remove(`SwordBlockHit_Destroy`);
    }

    public Block(ownerId: string, character: Model, serverTime: number) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;
        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");

        const offsetTime = Workspace.GetServerTimeNow() - serverTime;

        this.main.LastActionUpdate(ownerId, character, true);

        janitor.Remove(`LastActionCheck`);
        this.main.Equip(ownerId, character);

        this.main.StopKatanaSheathAnim(ownerId, character, true);

        if (character.HasTag("NPC") || this.main.IsLocalCharacter(character)) {
            const playerBus = this.main.api.eventBusAPI.New(ownerId, "Player");

            playerBus.Fire(
                "ChangeAnimationsPack",
                undefined,
                true,
                character,
                "shared.Assets.Animations.Sekiro.Movement.Block",
            );
        }
    }

    public BlockStop(ownerId: string, character: Model, serverTime: number) {
        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;
        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");

        const offsetTime = Workspace.GetServerTimeNow() - serverTime;

        this.main.LastActionUpdate(
            ownerId,
            character,
            (entity.miscData.get("LastAction") as boolean) ?? true,
        );

        if (character.HasTag("NPC") || this.main.IsLocalCharacter(character)) {
            const playerBus = this.main.api.eventBusAPI.New(ownerId, "Player");

            playerBus.Fire(
                "ChangeAnimationsPack",
                undefined,
                true,
                character,
                "shared.Assets.Animations.Sekiro.Movement.Unsheath",
            );
        }
    }

    public BlockHit(ownerId: string, character: Model, serverTime: number) {
        let janitor = this.main.GetJanitor(ownerId);

        const entity = this.main.api.entityStorageAPI.AddEntity(ownerId, character);
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;
        const combatAnimator = this.main.GetAnimator(character, ownerId, "CombatAnimator");

        const offsetTime = Workspace.GetServerTimeNow() - serverTime;

        let lastAction = (entity.miscData.get("LastAction") as boolean) ?? false;

        this.main.LastActionUpdate(ownerId, character, lastAction, false);

        if (!this.main.Debris.has(`${ownerId}_BlockHit`)) {
            this.main.Debris.set(`${ownerId}_BlockHit`, 1);
        }

        let blockHitTime = this.main.Debris.get(`${ownerId}_BlockHit`)! as number;

        let animToPlay = ParseRobloxAliasPath(
            `shared.Assets.Animations.Sekiro.Combat.Hits.Block_Hit_${blockHitTime}`,
        ) as Animation;
        let animation = undefined as AnimationTrack | undefined;

        animation = combatAnimator.PlayAnimation(
            animToPlay,
            `Sekiro_Block_Hit_${blockHitTime}`,
            true,
            AnimationsPriorities.CombatAnimation,
            false,
            0,
        );

        if (!this.main.IsLocalCharacter(character)) {
            janitor.Add(
                combatAnimator.animator.AnimationPlayed.Connect(
                    (animationTrack: AnimationTrack) => {
                        if (animationTrack.Animation?.AnimationId === animToPlay.AnimationId) {
                            animationTrack.Stop();
                            janitor.Remove(`Stop_Block_Hit_Animation`);
                        }
                    },
                ),
                "Disconnect",
                `Stop_Block_Hit_Animation`,
            );
        }

        this.createBlockHitVFX(ownerId, character, katana, blockHitTime);

        if (blockHitTime >= 3) {
            this.main.Debris.set(`${ownerId}_BlockHit`, 1);
        } else {
            this.main.Debris.set(`${ownerId}_BlockHit`, blockHitTime + 1);
        }
    }
}
