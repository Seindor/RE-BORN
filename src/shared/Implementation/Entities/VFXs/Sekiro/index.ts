import { Workspace, ReplicatedStorage, Players } from "@rbxts/services";
import { Controller, Dependency, OnStart } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";

import { IApperancy } from "shared/Types/Gameplay/PlayerApperance";
import { IModels } from "shared/Types/Assets/Models";
import { IAnimations } from "shared/Types/Assets/Animations";
import { ISekiroAnimations, ISekiroVFXs } from "./types";

import { SoundsUtil } from "shared/Utilities/SoundsUtil";
import { AnimationsPriorities } from "shared/Types/Gameplay/AnimationTypes";
import { emit } from "@zilibobi/forge-vfx";
import { ClientAtomReplication } from "shared/Application/ClientAtomReplication";

import { Basic_M1 } from "./Basic_M1";
import { Basic_Block } from "./Basic_Block";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";

const sharedScope = CompositionRootShared.createScope();

const Assets = ReplicatedStorage.WaitForChild("Assets");
const Models = Assets.WaitForChild("Models") as IModels;
const Animations = Assets.WaitForChild("Animations") as IAnimations;
const VFXs = Assets.WaitForChild("VFXs") as Folder;

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
                () => Models.Sekiro.Models.Sheath.Clone() as MeshPart,
            ),
            katana: this.getOrCreateDebris(
                `${ownerId}_Katana`,
                () => Models.Sekiro.Models.Katana.Clone() as MeshPart,
            ),
            prothesis: this.getOrCreateDebris(
                `${ownerId}_Prothesis`,
                () => Models.Sekiro.Models.Prosthesis.Clone() as MeshPart,
            ),
            rhWeld: this.getOrCreateDebris(
                `${ownerId}_RH_Katana_Weld`,
                () => Models.Sekiro.Welds["RH_Katana_Weld"].Clone() as Weld,
            ),
            sheathWeld: this.getOrCreateDebris(
                `${ownerId}_Sheath_Katana_Weld`,
                () => Models.Sekiro.Welds.Sheath_Katana_Weld.Clone() as Weld,
            ),
            torsoWeld: this.getOrCreateDebris(
                `${ownerId}_Torso_Sheath_Weld`,
                () => Models.Sekiro.Welds.Torso_Sheath_Weld.Clone() as Weld,
            ),
            leftArmWeld: this.getOrCreateDebris(
                `${ownerId}_Left_Arm_Prothesis_Weld`,
                () => Models.Sekiro.Welds["Left Arm_Prothesis_Weld"].Clone() as Weld,
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

        const { sheath, katana, prothesis, rhWeld, sheathWeld, torsoWeld, leftArmWeld } =
            this.createAssets(ownerId);

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

        rhWeld.Destroy();

        torsoWeld.Part0 = torso;
        torsoWeld.Part1 = sheath;
        torsoWeld.Enabled = true;

        leftArmWeld.Part0 = leftArm;
        leftArmWeld.Part1 = prothesis;
        leftArmWeld.Enabled = true;

        sheathWeld.Part0 = sheath;
        sheathWeld.Part1 = katana;
        sheathWeld.Enabled = true;

        torsoWeld.Parent = apperancy.Weapon.Welds;
        leftArmWeld.Parent = apperancy.Weapon.Welds;
        sheathWeld.Parent = apperancy.Weapon.Welds;

        sheath.Parent = apperancy.Weapon.Models;
        katana.Parent = apperancy.Weapon.Models;
        prothesis.Parent = apperancy.Weapon.Models;

        leftArm.Transparency = 1;

        janitor.Add(
            task.spawn(() => {
                task.delay(10, () => janitor.Remove(`ShirtCheck`));

                while (true) {
                    const shirt = character.FindFirstChildWhichIsA("Shirt");
                    (leftCharArm.WaitForChild("Body") as MeshPart).Color = leftArm.Color;
                    if (shirt) {
                        print("FOUND");
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

    public Equip(ownerId: string, character: Model) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, rhWeld, torsoWeld } = this.createAssets(ownerId);
        const rh = apperancy.Handlers.Parts.WaitForChild("RH") as BasePart;
        const torso = character.FindFirstChild("Torso") as BasePart;

        const sheathWeld = this.Debris.get(`${ownerId}_Sheath_Katana_Weld`) as Weld | undefined;
        sheathWeld?.Destroy();

        torsoWeld.Part0 = torso;
        torsoWeld.Part1 = sheath;
        torsoWeld.Enabled = true;

        if (!rhWeld.Enabled) {
            rhWeld.Part0 = rh;
            rhWeld.Part1 = katana;
            rhWeld.Enabled = true;
            rhWeld.Parent = apperancy.Weapon.Welds;
        }

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

    public Unequip(ownerId: string, character: Model) {
        let janitor = this.GetJanitor(ownerId);

        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const torso = character.WaitForChild("Torso") as BasePart;
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, sheathWeld, torsoWeld, rhWeld } = this.createAssets(ownerId);
        const emoteAnimator = this.GetAnimator(character, ownerId, "EmoteAnimator");

        const doUnequipVisual = () => {
            rhWeld.Destroy();

            torsoWeld.Part0 = torso;
            torsoWeld.Part1 = sheath;
            torsoWeld.Enabled = true;

            sheathWeld.Part0 = sheath;
            sheathWeld.Part1 = katana;
            sheathWeld.Enabled = true;
            sheathWeld.Parent = apperancy.Weapon.Welds;
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

    public FastUnequip(ownerId: string, character: Model) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const torso = character.WaitForChild("Torso") as BasePart;
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, sheathWeld, torsoWeld, rhWeld } = this.createAssets(ownerId);
        const emoteAnimator = this.GetAnimator(character, ownerId, "EmoteAnimator");

        const doUnequipVisual = () => {
            rhWeld.Destroy();

            torsoWeld.Part0 = torso;
            torsoWeld.Part1 = sheath;
            torsoWeld.Enabled = true;

            sheathWeld.Part0 = sheath;
            sheathWeld.Part1 = katana;
            sheathWeld.Enabled = true;
            sheathWeld.Parent = apperancy.Weapon.Welds;
        };

        doUnequipVisual();

        this.createSheathBlinkVFX(ownerId, sheath);
        this.LastActionUpdate(ownerId, character, false);
    }

    public LastActionUpdate(
        ownerId: string,
        character: Model,
        lastAction?: boolean,
        update?: boolean,
    ) {
        let janitor = this.GetJanitor(ownerId);

        const entity = this.api.entityStorageAPI.AddEntity(ownerId, character)!;
        entity.miscData.set("LastAction", lastAction ?? true);

        let entityLastAction = entity.miscData.get("LastAction")! as boolean;

        janitor.Remove(`LastActionCheck`);

        if (update === undefined || update === false) return;

        if (entityLastAction === true) {
            janitor.Add(
                task.delay(2.5, () => {
                    entity.miscData.set("LastAction", false);

                    const playerBus = this.api.eventBusAPI.New(ownerId, "Player");
                    const packName = entity.miscData.get("LastAction") ? "Unsheath" : "Sheath";
                    playerBus.Fire(
                        "ChangeAnimationsPack",
                        undefined,
                        true,
                        character,
                        `shared.Assets.Animations.Sekiro.Movement.${packName}`,
                    );

                    this.Unequip(ownerId, character);
                }),
                true,
                `LastActionCheck`,
            );
        }
    }

    public Destroy_Basic_M1(ownerId: string, character: Model, currentClick: number) {
        this.vfxModules.basic_M1.Destroy_Basic_M1(ownerId, character, currentClick);
    }

    public Basic_M1(
        ownerId: string,
        character: Model,
        currentClick: number,
        serverTime: number,
        ownerPing: number,
    ) {
        this.vfxModules.basic_M1.Basic_M1(ownerId, character, currentClick, serverTime, ownerPing);
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
}
