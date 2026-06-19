import { Workspace, ReplicatedStorage, Players } from "@rbxts/services";
import { Controller, Dependency, OnStart } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";

import { IApperancy } from "shared/Types/Gameplay/PlayerApperance";
import { IModels } from "shared/Types/Assets/Models";
import { IAnimations } from "shared/Types/Assets/Animations";
import { ISekiroAnimations, ISekiroModels, ISekiroVFXs } from "./types";

import { SoundsUtil } from "shared/Utilities/SoundsUtil";
import { AnimationsPriorities } from "shared/Types/Gameplay/AnimationTypes";
import { emit } from "@zilibobi/forge-vfx";
import { ClientAtomReplication } from "shared/Application/ClientAtomReplication";

import { Basic_M1 } from "./Basic_M1";
import { Basic_Block } from "./Basic_Block";
import { Basic_Parry } from "./Basic_Parry";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { VFXModules } from "..";

const sharedScope = CompositionRootShared.createScope();

const Assets = ReplicatedStorage.WaitForChild("Assets");
const Models = Assets.WaitForChild("Models") as IModels;
const Animations = Assets.WaitForChild("Animations") as IAnimations;
const VFXs = Assets.WaitForChild("VFXs") as Folder;

const SekiroModels = Models.Sekiro as ISekiroModels;
const SekiroAnimations = Animations.WaitForChild("Sekiro") as ISekiroAnimations;
const SekiroVFXs = VFXs.WaitForChild("Sekiro") as ISekiroVFXs;

const CHARACTER_NAME = "Sekiro";

@Controller()
export class Sekiro implements OnStart {
    public player = Players.LocalPlayer;
    public playerStringId = tostring(this.player.UserId);
    public janitors = new Map<string, Janitor>();
    public Debris = new Map<string, any>();

    public api = {
        eventBusAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI),
        entityStorageAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI),
        animationsAPI: sharedScope.resolve(SharedRegistry.Singletons.API.AnimationsAPI),
    };

    public vfxModules = {
        basic_M1: new Basic_M1(this),
        basic_Block: new Basic_Block(this),
        basic_Parry: new Basic_Parry(this),
        default: VFXModules.Default(),
    };

    onStart(): void {
        let janitor = this.GetJanitor(this.playerStringId);

        const atomReplication = Dependency<ClientAtomReplication>();
        const playerBus = this.api.eventBusAPI.New(this.playerStringId, "Player");

        janitor.Add(
            task.spawn(() => {
                while (!atomReplication.GetLocalPlayerData) task.wait();

                playerBus.Subscribe(
                    "CharacterLoaded",
                    (character: Model) => {
                        if (
                            atomReplication.GetLocalPlayerData()!.Equipment.Character.Name !==
                            CHARACTER_NAME
                        )
                            return;
                        this.Spawn(this.playerStringId, character);
                    },
                    undefined,
                    "SekiroInit",
                );
            }),
            true,
            "Sekiro_OnStart",
        );
    }

    public GetAllJanitors() {
        return this.janitors;
    }

    public GetJanitor(ownerId: string, character?: Model): Janitor<any> {
        if (this.janitors.has(ownerId)) return this.janitors.get(ownerId)!;
        let janitor = new Janitor<any>();

        if (character) {
            janitor.LinkToInstance(character, true);
        }

        this.janitors.set(ownerId, janitor);
        return janitor;
    }

    private getOrCreateDebris<T extends Instance>(key: string, creator: () => T): T {
        const existing = this.Debris.get(key) as T | undefined;
        if (existing && existing.Parent !== undefined) return existing;

        const created = creator();
        this.Debris.set(key, created);
        return created;
    }

    private createAssets(ownerId: string) {
        return {
            sheath: this.getOrCreateDebris(
                `${ownerId}_Sheath`,
                () => SekiroModels.Models.Sheath.Clone() as MeshPart,
            ),
            katana: this.getOrCreateDebris(
                `${ownerId}_Katana`,
                () => SekiroModels.Models.Katana.Clone() as MeshPart,
            ),

            mortalsheath: this.getOrCreateDebris(
                `${ownerId}_MortalSheath`,
                () => SekiroModels.Models.MortalSheath.Clone() as MeshPart,
            ),

            mortalBlade: this.getOrCreateDebris(
                `${ownerId}_MortalBlade`,
                () => SekiroModels.Models.MortalBlade.Clone() as MeshPart,
            ),

            prothesis: this.getOrCreateDebris(
                `${ownerId}_Prothesis`,
                () => SekiroModels.Models.Prosthesis.Clone() as MeshPart,
            ),
            RH_Katana_Weld: this.getOrCreateDebris(
                `${ownerId}_RH_Katana_Weld`,
                () => SekiroModels.Welds["RH_Katana_Weld"].Clone() as Weld,
            ),

            Sheath_Katana_Weld: this.getOrCreateDebris(
                `${ownerId}_Sheath_Katana_Weld`,
                () => SekiroModels.Welds.Sheath_Katana_Weld.Clone() as Weld,
            ),
            Torso_Sheath_Weld: this.getOrCreateDebris(
                `${ownerId}_Torso_Sheath_Weld`,
                () => SekiroModels.Welds.Torso_Sheath_Weld.Clone() as Weld,
            ),

            RH_MortalBlade_Weld: this.getOrCreateDebris(
                `${ownerId}_RH_MortalBlade_Weld`,
                () => SekiroModels.Welds["RH_MortalBlade_Weld"].Clone() as Weld,
            ),

            MortalSheath_MortalBlade_Weld: this.getOrCreateDebris(
                `${ownerId}_MortalSheath_MortalBlade_Weld`,
                () => SekiroModels.Welds.MortalSheath_MortalBlade_Weld.Clone() as Weld,
            ),

            Torso_MortalSheath_Weld: this.getOrCreateDebris(
                `${ownerId}_Torso_MortalSheath_Weld`,
                () => SekiroModels.Welds.Torso_MortalSheath_Weld.Clone() as Weld,
            ),

            Left_Arm_Prothesis_Weld: this.getOrCreateDebris(
                `${ownerId}_Left_Arm_Prothesis_Weld`,
                () => SekiroModels.Welds["Left Arm_Prothesis_Weld"].Clone() as Weld,
            ),
        };
    }

    public GetAnimator(character: Model, ownerId: string, packName: string) {
        return this.api.animationsAPI.CreateAnimator({ Character: character }, packName, ownerId);
    }

    public IsLocalCharacter(character: Model): boolean {
        return this.player === Players.GetPlayerFromCharacter(character);
    }

    private createSheathBlinkVFX(ownerId: string, sheath: MeshPart) {
        let janitor = this.GetJanitor(ownerId);

        const sheathBlink = SekiroVFXs.FindFirstChild("SheathBlink")!.Clone() as Attachment;

        sheathBlink.Parent = sheath;

        emit(sheathBlink);

        janitor.Add(sheathBlink, "Destroy", `SheathBlink_VFX`);

        janitor.Add(
            task.delay(2, () => {
                this.removeSheathBlinkVFX(ownerId);
            }),
            true,
            `SheathBlink_VFX_Destroy`,
        );
    }

    public removeSheathBlinkVFX(ownerId: string) {
        let janitor = this.GetJanitor(ownerId);

        janitor.Remove(`SheathBlink_VFX`);
        janitor.Remove(`SheathBlink_VFX_Destroy`);
    }

    private createSheathVFX(ownerId: string, katana: MeshPart) {
        let janitor = this.GetJanitor(ownerId);

        const at1 = (SekiroVFXs.M1.FindFirstChild("1") as Attachment).Clone();
        const at2 = (SekiroVFXs.M1.FindFirstChild("2") as Attachment).Clone();
        const at3 = (SekiroVFXs.M1.FindFirstChild("3") as Attachment).Clone();
        const smooth = (SekiroVFXs.M1.FindFirstChild("Smooth") as Trail).Clone();
        const wind = (SekiroVFXs.M1.FindFirstChild("wind") as Trail).Clone();
        const sheathSound = SoundsUtil.CreateSound("Sekiro/Sheath");

        at1.Parent = katana;
        at2.Parent = katana;
        at3.Parent = katana;
        smooth.Parent = katana;
        wind.Parent = katana;
        sheathSound.Parent = katana;

        smooth.Attachment0 = at2;
        smooth.Attachment1 = at1;
        wind.Attachment0 = at1;
        wind.Attachment1 = at3;
        smooth.Enabled = true;
        wind.Enabled = true;

        SoundsUtil.PlaySound(sheathSound, true);

        janitor.Add(at1, "Destroy", `at1`);
        janitor.Add(at2, "Destroy", `at2`);
        janitor.Add(at3, "Destroy", `at3`);
        janitor.Add(smooth, "Destroy", `smooth`);
        janitor.Add(wind, "Destroy", `wind`);
        janitor.Add(sheathSound, "Destroy", `Sheath_Sound`);
    }

    private destroySheathVFX(ownerId: string) {
        let janitor = this.GetJanitor(ownerId);

        janitor.Remove(`at1`);
        janitor.Remove(`at2`);
        janitor.Remove(`at3`);
        janitor.Remove(`smooth`);
        janitor.Remove(`wind`);
    }

    public StopKatanaSheathAnim(ownerId: string, character: Model, removeSound?: boolean) {
        let janitor = this.GetJanitor(ownerId);

        const emoteAnimator = this.GetAnimator(character, ownerId, "EmoteAnimator");

        emoteAnimator.StopAnimation("Katana_Sheathing", 0, true, true);

        for (const track of emoteAnimator.animator.GetPlayingAnimationTracks()) {
            if (
                track.Animation?.AnimationId === SekiroAnimations.Misc.Katana_Sheathing.AnimationId
            ) {
                track.Stop();
            }
        }

        janitor.Remove(`Sekiro_Katana_Sheathing_swingreg`);
        janitor.Remove(`Sekiro_Katana_Sheathing_swingend`);
        janitor.Remove(`Sekiro_Katana_Sheathing_sheath`);
        this.destroySheathVFX(ownerId);
        this.removeSheathBlinkVFX(ownerId);

        if (removeSound) {
            janitor.Remove(`Sheath_Sound`);
        }
    }

    public Spawn(ownerId: string, character: Model) {
        let janitor = this.GetJanitor(ownerId);

        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const {
            sheath,
            katana,
            mortalsheath,
            mortalBlade,
            prothesis,
            Sheath_Katana_Weld,
            Torso_Sheath_Weld,
            MortalSheath_MortalBlade_Weld,
            Torso_MortalSheath_Weld,
            Left_Arm_Prothesis_Weld,
        } = this.createAssets(ownerId);

        const leftArm = character.WaitForChild("Left Arm") as MeshPart;
        const leftCharArm = prothesis.WaitForChild("LeftCharArm") as MeshPart;
        const torso = character.WaitForChild("Torso") as BasePart;

        playerBus.Fire(
            "ChangeAnimationsPack",
            undefined,
            true,
            character,
            "shared.Assets.Animations.Sekiro.Movement.Sheath",
        );

        janitor.Add(
            task.spawn(() => {
                Torso_Sheath_Weld.Part0 = torso;
                Torso_Sheath_Weld.Part1 = sheath;
                Torso_Sheath_Weld.Enabled = true;

                Sheath_Katana_Weld.Part0 = sheath;
                Sheath_Katana_Weld.Part1 = katana;
                Sheath_Katana_Weld.Enabled = true;

                Torso_MortalSheath_Weld.Part0 = torso;
                Torso_MortalSheath_Weld.Part1 = mortalsheath;
                Torso_MortalSheath_Weld.Enabled = true;

                MortalSheath_MortalBlade_Weld.Part0 = mortalsheath;
                MortalSheath_MortalBlade_Weld.Part1 = mortalBlade;
                MortalSheath_MortalBlade_Weld.Enabled = true;

                Left_Arm_Prothesis_Weld.Part0 = leftArm;
                Left_Arm_Prothesis_Weld.Part1 = prothesis;
                Left_Arm_Prothesis_Weld.Enabled = true;

                Torso_Sheath_Weld.Parent = apperancy.Weapon.Welds;
                Sheath_Katana_Weld.Parent = apperancy.Weapon.Welds;
                Torso_MortalSheath_Weld.Parent = apperancy.Weapon.Welds;
                MortalSheath_MortalBlade_Weld.Parent = apperancy.Weapon.Welds;
                Left_Arm_Prothesis_Weld.Parent = apperancy.Weapon.Welds;

                sheath.Parent = apperancy.Weapon.Models;
                katana.Parent = apperancy.Weapon.Models;
                mortalsheath.Parent = apperancy.Weapon.Models;
                mortalBlade.Parent = apperancy.Weapon.Models;
                prothesis.Parent = apperancy.Weapon.Models;
            }),
            true,
            `Spawn_Welds_Setup`,
        );

        leftArm.Transparency = 1;

        janitor.Add(
            task.spawn(() => {
                task.delay(10, () => janitor.Remove(`ShirtCheck`));

                while (true) {
                    const shirt = character.FindFirstChildWhichIsA("Shirt");
                    (leftCharArm.WaitForChild("Body") as MeshPart).Color = leftArm.Color;
                    if (shirt) {
                        leftCharArm.TextureID = shirt.ShirtTemplate;
                        leftCharArm.Transparency = 0.02;
                        janitor.Remove(`ShirtCheck`);
                    } else {
                        leftCharArm.Transparency = 1;
                    }
                    task.wait();
                }
            }),
            true,
            `ShirtCheck`,
        );

        janitor.Add(character, "Destroy", `Sekiro_Character`);
    }

    public Equip(ownerId: string, character: Model, changeAnimations?: boolean) {
        let janitor = this.GetJanitor(ownerId);

        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, RH_Katana_Weld, Torso_Sheath_Weld, Sheath_Katana_Weld } =
            this.createAssets(ownerId);
        const rh = apperancy.Handlers.Parts.WaitForChild("RH") as BasePart;
        const torso = character.FindFirstChild("Torso") as BasePart;

        this.InterruptUnequip(ownerId, character);

        janitor.Remove(`Spawn_Welds_Setup`);

        Torso_Sheath_Weld.Part0 = torso;
        Torso_Sheath_Weld.Part1 = sheath;
        Torso_Sheath_Weld.Enabled = true;

        Sheath_Katana_Weld.Enabled = false;
        Sheath_Katana_Weld.Destroy();
        this.Debris.delete(`${ownerId}_Sheath_Katana_Weld`);

        RH_Katana_Weld.Enabled = false;

        RH_Katana_Weld.Part0 = rh;
        RH_Katana_Weld.Part1 = katana;
        RH_Katana_Weld.Enabled = true;
        RH_Katana_Weld.Parent = apperancy.Weapon.Welds;

        if (changeAnimations === true) {
            if (this.IsLocalCharacter(character)) {
                playerBus.Fire(
                    "ChangeAnimationsPack",
                    undefined,
                    true,
                    character,
                    "shared.Assets.Animations.Sekiro.Movement.Unsheath",
                );
            }
        }
    }

    public Unequip(ownerId: string, character: Model) {
        let janitor = this.GetJanitor(ownerId);

        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const torso = character.WaitForChild("Torso") as BasePart;
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, Sheath_Katana_Weld, Torso_Sheath_Weld, RH_Katana_Weld } =
            this.createAssets(ownerId);
        const emoteAnimator = this.GetAnimator(character, ownerId, "EmoteAnimator");

        if (!RH_Katana_Weld.Enabled) return;

        const doUnequipVisual = () => {
            RH_Katana_Weld.Destroy();

            Torso_Sheath_Weld.Part0 = torso;
            Torso_Sheath_Weld.Part1 = sheath;
            Torso_Sheath_Weld.Enabled = true;

            Sheath_Katana_Weld.Part0 = sheath;
            Sheath_Katana_Weld.Part1 = katana;
            Sheath_Katana_Weld.Enabled = true;
            Sheath_Katana_Weld.Parent = apperancy.Weapon.Welds;
        };

        let animToPlay = SekiroAnimations.Misc.Katana_Sheathing;
        let animation: AnimationTrack | undefined;

        if (character.HasTag("NPC") || this.IsLocalCharacter(character)) {
            animation = emoteAnimator.PlayAnimation(
                animToPlay,
                "Katana_Sheathing",
                false,
                AnimationsPriorities.CombatAnimation,
                false,
                0.15,
            );
        } else {
            while (!animation) {
                for (const track of emoteAnimator.animator.GetPlayingAnimationTracks()) {
                    if (track.Animation?.AnimationId === animToPlay.AnimationId) {
                        animation = track;
                    }
                }
                task.wait();
            }
        }

        janitor.Add(
            animation
                .GetMarkerReachedSignal("swingreg")
                .Connect(() => this.createSheathVFX(ownerId, katana)),
            "Disconnect",
            `Sekiro_Katana_Sheathing_swingreg`,
        );

        janitor.Add(
            animation
                .GetMarkerReachedSignal("swingend")
                .Connect(() => this.destroySheathVFX(ownerId)),
            "Disconnect",
            `Sekiro_Katana_Sheathing_swingend`,
        );

        janitor.Add(
            animation.GetMarkerReachedSignal("sheath").Connect(() => {
                doUnequipVisual();
                this.createSheathBlinkVFX(ownerId, sheath);
                if (this.IsLocalCharacter(character)) {
                    playerBus.Fire(
                        "ChangeAnimationsPack",
                        undefined,
                        true,
                        character,
                        "shared.Assets.Animations.Sekiro.Movement.Sheath",
                    );
                }
            }),
            "Disconnect",
            `Sekiro_Katana_Sheathing_sheath`,
        );
    }

    public InterruptUnequip(ownerId: string, character: Model) {
        let janitor = this.GetJanitor(ownerId);

        this.StopKatanaSheathAnim(ownerId, character, true);

        janitor.Remove(`Sekiro_Katana_Sheathing_swingreg`);
        janitor.Remove(`Sekiro_Katana_Sheathing_swingend`);
        janitor.Remove(`Sekiro_Katana_Sheathing_sheath`);
    }

    public FastUnequip(ownerId: string, character: Model) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const torso = character.WaitForChild("Torso") as BasePart;
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, Sheath_Katana_Weld, Torso_Sheath_Weld, RH_Katana_Weld } =
            this.createAssets(ownerId);
        const emoteAnimator = this.GetAnimator(character, ownerId, "EmoteAnimator");

        const doUnequipVisual = () => {
            RH_Katana_Weld.Destroy();

            Torso_Sheath_Weld.Part0 = torso;
            Torso_Sheath_Weld.Part1 = sheath;
            Torso_Sheath_Weld.Enabled = true;

            Sheath_Katana_Weld.Part0 = sheath;
            Sheath_Katana_Weld.Part1 = katana;
            Sheath_Katana_Weld.Enabled = true;
            Sheath_Katana_Weld.Parent = apperancy.Weapon.Welds;
        };

        doUnequipVisual();

        this.createSheathBlinkVFX(ownerId, sheath);
        //this.LastActionUpdate(ownerId, character, false);
    }

    // public LastActionUpdate(
    //     ownerId: string,
    //     character: Model,
    //     lastAction?: boolean,
    //     update?: boolean,
    // ) {
    //     let janitor = this.GetJanitor(ownerId);

    //     const entity = this.api.entityStorageAPI.AddEntity(ownerId, character)!;
    //     entity.miscData.set("LastAction", lastAction ?? true);

    //     let entityLastAction = entity.miscData.get("LastAction")! as boolean;

    //     janitor.Remove(`LastActionCheck`);

    //     if (update === undefined || update === false) return;

    //     if (entityLastAction === true) {
    //         janitor.Add(
    //             task.delay(2.5, () => {
    //                 entity.miscData.set("LastAction", false);

    //                 const playerBus = this.api.eventBusAPI.New(ownerId, "Player");
    //                 const packName = entity.miscData.get("LastAction") ? "Unsheath" : "Sheath";
    //                 playerBus.Fire(
    //                     "ChangeAnimationsPack",
    //                     undefined,
    //                     true,
    //                     character,
    //                     `shared.Assets.Animations.Sekiro.Movement.${packName}`,
    //                 );

    //                 this.Unequip(ownerId, character);
    //             }),
    //             true,
    //             `LastActionCheck`,
    //         );
    //     }
    // }

    public Destroy_Basic_M1(ownerId: string, character: Model, currentClick: number) {
        this.vfxModules.basic_M1.Destroy_Basic_M1(ownerId, character, currentClick);
    }

    public Basic_M1(
        ownerId: string,
        character: Model,
        currentClick: number,
        animationToPlay: Animation,
        serverTime: number,
    ) {
        this.vfxModules.basic_M1.Basic_M1(
            ownerId,
            character,
            currentClick,
            animationToPlay,
            serverTime,
        );
    }

    public Hit(ownerId: string, character: Model, currentClick: number, serverTime: number) {
        this.vfxModules.basic_M1.Hit(ownerId, character, currentClick, serverTime);
    }

    public Block(ownerId: string, character: Model, serverTime: number) {
        this.vfxModules.basic_Block.Block(ownerId, character, serverTime);
    }

    public BlockStop(ownerId: string, character: Model, serverTime: number) {
        this.vfxModules.basic_Block.BlockStop(ownerId, character, serverTime);
    }

    public BlockHit(ownerId: string, character: Model, serverTime: number) {
        this.vfxModules.basic_Block.BlockHit(ownerId, character, serverTime);
    }

    public BlockBreak(ownerId: string, character: Model, serverTime: number, endTime: number) {
        this.vfxModules.basic_Block.BlockBreak(ownerId, character, serverTime, endTime);
    }

    public Parry_Cast(ownerId: string, character: Model, serverTime: number) {
        this.vfxModules.basic_Parry.Parry_Cast(ownerId, character, serverTime);
    }

    public WasParried(ownerId: string, character: Model, serverTime: number) {
        this.vfxModules.basic_Parry.WasParried(ownerId, character, serverTime);
    }

    public Parried(ownerId: string, character: Model, serverTime: number) {
        this.vfxModules.basic_Parry.Parried(ownerId, character, serverTime);
    }

    public Dodge(ownerId: string, character: Model, serverTime: number) {
        this.vfxModules.default.Dodge(ownerId, character, serverTime);
    }
}
