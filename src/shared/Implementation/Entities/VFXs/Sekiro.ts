import { Workspace, ReplicatedStorage, Players } from "@rbxts/services";

import { Controller, Dependency, OnStart } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";

import { ClientAtomReplication } from "shared/Application/ClientAtomReplication";

import { IApperancy } from "shared/Types/Gameplay/PlayerApperance";
import { IModels } from "shared/Types/Assets/Models";
import { IAnimations } from "shared/Types/Assets/Animations";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";

import { AllSoundPaths, SoundsUtil } from "shared/Utilities/SoundsUtil";
import { ArrayHelper } from "shared/Utilities/ArrayHelper";
import { AnimationsPriorities } from "shared/Types/Gameplay/AnimationTypes";

let sharedScope = CompositionRootShared.createScope();

let entityStorageAPI = sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI);

let Assets = ReplicatedStorage.WaitForChild("Assets");
let Models = Assets.WaitForChild("Models") as IModels;
let Animations = Assets.WaitForChild("Animations") as IAnimations;
let VFXs = Assets.WaitForChild("VFXs") as Folder;

let SekiroVFXs = VFXs.WaitForChild("Sekiro") as ISekiroVFXs;

const CHARACTER_NAME = "Sekiro";

type EventTimings = {
    mark: number;
    swingreg: number;
    swingend: number;
    hitreg: number;
    hitend: number;
};

type TimingData = {
    duration: number;
    cooldown: number;
    events: EventTimings;
};

type Timings = Record<string, TimingData>;

export type ISekiroVFXs = {
    ["M1"]: {
        ["Beam"]: Trail;
        ["Smooth"]: Trail;
        ["at1"]: Attachment;
        ["at2"]: Attachment;
        ["at3"]: Attachment;
        ["wind"]: Trail;
        ["windstyle"]: Trail;
    } & Folder;
} & Folder;

@Controller()
export class Sekiro implements OnStart {
    public player = Players.LocalPlayer;
    public _janitor = new Janitor<any>();

    public LastActions = new Map<string, boolean>();

    public api = {
        eventBusAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI),
        animationsAPI: sharedScope.resolve(SharedRegistry.Singletons.API.AnimationsAPI),
    };

    constructor() {}

    onStart(): void {
        const atomReplication = Dependency<ClientAtomReplication>();

        const playerBus = this.api.eventBusAPI.New(tostring(Players.LocalPlayer.UserId), "Player");

        this._janitor.Add(
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

                        this.Spawn(character);
                    },
                    undefined,
                    "SekiroInit",
                );
            }),
            true,
            "Sekiro_OnStart",
        );

        this._janitor.Add(
            task.spawn(() => {
                while (!atomReplication.GetLocalPlayerData) task.wait();

                playerBus.Subscribe(
                    "EquipWeapon",
                    (character: Model, equip: boolean) => {
                        if (
                            atomReplication.GetLocalPlayerData()!.Equipment.Character.Name !==
                            CHARACTER_NAME
                        )
                            return;

                        if (equip) this.Equip(character);
                        else this.Unequip(character);
                    },
                    undefined,
                    "SekiroEquip",
                );
            }),
            true,
            "Sekiro_OnEquipStart",
        );
    }

    private createAssets(ownerId: string, apperancy: IApperancy) {
        const prefix = `${ownerId}_Sekiro`;

        const sheath =
            (apperancy.Weapon.Models.FindFirstChild("Sheath") as MeshPart) ??
            (Models.Sekiro.Models.Sheath.Clone() as MeshPart);

        const katana =
            (apperancy.Weapon.Models.FindFirstChild("Katana") as MeshPart) ??
            (Models.Sekiro.Models.Katana.Clone() as MeshPart);

        const rhWeld =
            (apperancy.Weapon.Welds.FindFirstChild("RH_Katana_Weld") as Weld) ??
            (Models.Sekiro.Welds["RH_Katana_Weld"].Clone() as Weld);

        const sheathWeld =
            (apperancy.Weapon.Welds.FindFirstChild("Sheath_Katana_Weld") as Weld) ??
            (Models.Sekiro.Welds.Sheath_Katana_Weld.Clone() as Weld);

        const torsoWeld =
            (apperancy.Weapon.Welds.FindFirstChild("Torso_Sheath_Weld") as Weld) ??
            (Models.Sekiro.Welds.Torso_Sheath_Weld.Clone() as Weld);

        return { sheath, katana, rhWeld, sheathWeld, torsoWeld };
    }

    public Spawn(character: Model) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;

        const ownerId = tostring(Players.GetPlayerFromCharacter(character)!.UserId);
        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, rhWeld, sheathWeld, torsoWeld } = this.createAssets(
            ownerId,
            apperancy,
        );

        const rh = apperancy.Handlers.Parts.WaitForChild("RH") as BasePart;
        const torso = character.WaitForChild("Torso") as BasePart;

        playerBus.Fire("ChangeAnimationsPack", undefined, true, character, "Sekiro_Unequipped");

        rhWeld.Destroy();

        torsoWeld.Part0 = torso;
        torsoWeld.Part1 = sheath;
        torsoWeld.Enabled = true;

        sheathWeld.Part0 = sheath;
        sheathWeld.Part1 = katana;
        sheathWeld.Enabled = true;

        torsoWeld.Parent = apperancy.Weapon.Welds;
        sheathWeld.Parent = apperancy.Weapon.Welds;

        sheath.Parent = apperancy.Weapon.Models;
        katana.Parent = apperancy.Weapon.Models;

        this._janitor.Add(character, "Destroy", `${ownerId}_Sekiro_Character`);
    }

    public Equip(character: Model) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const ownerId = tostring(Players.GetPlayerFromCharacter(character)!.UserId);

        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, rhWeld, torsoWeld, sheathWeld } = this.createAssets(
            ownerId,
            apperancy,
        );

        const rh = apperancy.Handlers.Parts.WaitForChild("RH") as BasePart;
        const torso = character.FindFirstChild("Torso") as BasePart;

        sheathWeld.Destroy();

        torsoWeld.Part0 = torso;
        torsoWeld.Part1 = sheath;
        torsoWeld.Enabled = true;

        if (!rhWeld.Enabled) {
            rhWeld.Part0 = rh;
            rhWeld.Part1 = katana;
            rhWeld.Enabled = true;
        }

        torsoWeld.Parent = apperancy.Weapon.Welds;
        rhWeld.Parent = apperancy.Weapon.Welds;
        sheath.Parent = apperancy.Weapon.Models;
        katana.Parent = apperancy.Weapon.Models;

        playerBus.Fire("ChangeAnimationsPack", undefined, true, character, "Sekiro_Equipped");
    }

    public Unequip(character: Model) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const torso = character.WaitForChild("Torso") as BasePart;

        const ownerId = tostring(Players.GetPlayerFromCharacter(character)!.UserId);

        const playerBus = this.api.eventBusAPI.New(ownerId, "Player");

        const { sheath, katana, sheathWeld, torsoWeld, rhWeld } = this.createAssets(
            ownerId,
            apperancy,
        );

        rhWeld.Destroy();

        torsoWeld.Part0 = torso;
        torsoWeld.Part1 = sheath;
        torsoWeld.Enabled = true;

        sheathWeld.Part0 = sheath;
        sheathWeld.Part1 = katana;
        sheathWeld.Enabled = true;

        torsoWeld.Parent = apperancy.Weapon.Welds;
        sheathWeld.Parent = apperancy.Weapon.Welds;

        sheath.Parent = apperancy.Weapon.Models;
        katana.Parent = apperancy.Weapon.Models;

        playerBus.Fire("ChangeAnimationsPack", undefined, true, character, "Sekiro_Unequipped");
    }

    public LastActionUpdate(ownerId: string, character: Model) {
        print(entityStorageAPI.GetEntities());
        let entity = entityStorageAPI.GetEntity(ownerId)!;
        entity.miscData.set("LastAction", true);

        let lastAction = entity.miscData.get("LastAction")!;

        let packName = "Sekiro_Equipped";

        this._janitor.Remove(`${ownerId}_LastActionCheck`);

        this._janitor.Add(
            task.delay(5, () => {
                entity.miscData.set("LastAction", false);
                packName = "Sekiro_Unequipped";
                this.Unequip(character);
            }),
            true,
            `${ownerId}_LastActionCheck`,
        );

        if (lastAction) {
            packName = "Sekiro_Equipped";
            this.Equip(character);
        } else {
        }

        if (Players.GetPlayerFromCharacter(character)) {
            const playerBus = this.api.eventBusAPI.New(ownerId, "Player");
            playerBus.Fire("ChangeAnimationsPack", undefined, true, character, packName);
        }
    }

    public M1(
        ownerId: string,
        character: Model,
        currentClick: number,
        serverTime: number,
        ownerPing: number,
        timings: Timings,
    ) {
        const apperancy = character.WaitForChild("Apperancy") as IApperancy;
        const katana = apperancy.Weapon.Models.WaitForChild("Katana") as MeshPart;
        let clientTime = Workspace.GetServerTimeNow();
        const ping = this.player.GetNetworkPing();
        const oneWay = ping * 1.125;
        const jitterBuffer = math.clamp(ping * 0.1, 0.02, 0.15);

        const offsetTime = Workspace.GetServerTimeNow() - serverTime;

        const timing = timings[`M1_${currentClick}`];

        const animator = this.api.animationsAPI.CreateAnimator(
            { Character: character },
            "CombatAnimator",
            ownerId,
        );

        this._janitor.Remove(`${ownerId}_animation_Check`);

        let animation = undefined as AnimationTrack | undefined;
        let animToPlay = Animations.Sekiro_Equipped.FindFirstChild(
            `M1_${currentClick}`,
        ) as Animation;

        this.LastActionUpdate(ownerId, character);

        if (this.player !== Players.GetPlayerFromCharacter(character)) {
            this._janitor.Add(
                animator.animator.AnimationPlayed.Connect((track: AnimationTrack) => {
                    if (track.Animation?.Name === `M1_${currentClick}`) {
                        print("FOUND ANIM");
                        animation = track;
                    }
                }),
                "Disconnect",
                `${ownerId}_animation_Check`,
            );
        }

        if (this.player === Players.GetPlayerFromCharacter(character)) {
            const playerBus = this.api.eventBusAPI.New(ownerId, "Player");
            playerBus.Fire("ChangeAnimationsPack", undefined, true, character, "Sekiro_Equipped");

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
                let tracks = animator.animator.GetPlayingAnimationTracks();
                for (const track of tracks) {
                    if (track.Animation?.AnimationId === animToPlay.AnimationId) {
                        print("FOUND ANIM");
                        animation = track;
                        animation.TimePosition = math.clamp(offsetTime, 0, animation.Length);
                    }
                }
                task.wait();
            }
        }

        while (animation.Length <= 0) {
            task.wait();
        }

        print("PASSED ANIMATION_LENGTH");

        //animation.TimePosition = math.clamp(offsetTime, 0, animation.Length);

        const prefix = `${ownerId}_M1_${currentClick}`;

        const createSwingreg = () => {
            print("SWINGREG <--------------------");
            const at1 = (SekiroVFXs.M1.FindFirstChild("1") as Attachment).Clone();
            const at2 = (SekiroVFXs.M1.FindFirstChild("2") as Attachment).Clone();

            const beam = (SekiroVFXs.M1.FindFirstChild("Beam") as Trail).Clone();
            const smooth = (SekiroVFXs.M1.FindFirstChild("Smooth") as Trail).Clone();
            const wind = (SekiroVFXs.M1.FindFirstChild("wind") as Trail).Clone();
            const windstyle = (SekiroVFXs.M1.FindFirstChild("windstyle") as Trail).Clone();

            const sound = SoundsUtil.CreateSound(`Sekiro/Swings/${currentClick}` as AllSoundPaths);

            at1.Parent = katana;
            at2.Parent = katana;
            beam.Parent = katana;
            smooth.Parent = katana;
            wind.Parent = katana;
            windstyle.Parent = katana;
            sound.Parent = katana;

            beam.Attachment0 = at2;
            beam.Attachment1 = at1;

            smooth.Attachment0 = at2;
            smooth.Attachment1 = at1;

            wind.Attachment0 = at1;
            wind.Attachment1 = at2;

            windstyle.Attachment0 = at1;
            windstyle.Attachment1 = at2;

            beam.Enabled = true;
            smooth.Enabled = true;
            wind.Enabled = true;
            windstyle.Enabled = true;

            SoundsUtil.PlaySound(sound, true);

            this._janitor.Add(at1, "Destroy", `${prefix}_at1`);
            this._janitor.Add(at2, "Destroy", `${prefix}_at2`);
            this._janitor.Add(beam, "Destroy", `${prefix}_beam`);
            this._janitor.Add(smooth, "Destroy", `${prefix}_smooth`);
            this._janitor.Add(wind, "Destroy", `${prefix}_wind`);
            this._janitor.Add(windstyle, "Destroy", `${prefix}_windstyle`);
            this._janitor.Add(sound, "Destroy", `${prefix}_sound`);
        };

        const createSwingend = () => {
            print("SWINGEND <--------------------");
            this._janitor.Remove(`${prefix}_at1`);
            this._janitor.Remove(`${prefix}_at2`);
            this._janitor.Remove(`${prefix}_beam`);
            this._janitor.Remove(`${prefix}_smooth`);
            this._janitor.Remove(`${prefix}_wind`);
            this._janitor.Remove(`${prefix}_windstyle`);
        };

        if (offsetTime >= timing.events.swingreg) {
            createSwingreg();
        } else {
            animation.GetMarkerReachedSignal("swingreg").Once(() => {
                print("Marker_swingreg");
                createSwingreg();
            });
        }

        if (offsetTime >= timing.events.swingend) {
            createSwingend();
        } else {
            animation.GetMarkerReachedSignal("swingend").Once(() => {
                print("Marker_swingend");
                createSwingend();
            });
        }

        // this._janitor.Add(
        //     task.delay(timing.events.swingreg - offsetTime, () => {
        //         const at1 = (SekiroVFXs.M1.FindFirstChild("1") as Attachment).Clone();
        //         const at2 = (SekiroVFXs.M1.FindFirstChild("2") as Attachment).Clone();

        //         const beam = (SekiroVFXs.M1.FindFirstChild("Beam") as Trail).Clone();
        //         const smooth = (SekiroVFXs.M1.FindFirstChild("Smooth") as Trail).Clone();
        //         const wind = (SekiroVFXs.M1.FindFirstChild("wind") as Trail).Clone();
        //         const windstyle = (SekiroVFXs.M1.FindFirstChild("windstyle") as Trail).Clone();

        //         const sound = SoundsUtil.CreateSound(
        //             `Sekiro/Swings/${currentClick}` as AllSoundPaths,
        //         );

        //         at1.Parent = Sekiro;
        //         at2.Parent = Sekiro;
        //         beam.Parent = Sekiro;
        //         smooth.Parent = Sekiro;
        //         wind.Parent = Sekiro;
        //         windstyle.Parent = Sekiro;
        //         sound.Parent = Sekiro;

        //         beam.Attachment0 = at2;
        //         beam.Attachment1 = at1;

        //         smooth.Attachment0 = at2;
        //         smooth.Attachment1 = at1;

        //         wind.Attachment0 = at1;
        //         wind.Attachment1 = at2;

        //         windstyle.Attachment0 = at1;
        //         windstyle.Attachment1 = at2;

        //         beam.Enabled = true;
        //         smooth.Enabled = true;
        //         wind.Enabled = true;
        //         windstyle.Enabled = true;

        //         SoundsUtil.PlaySound(sound, true);

        //         this._janitor.Add(at1, "Destroy", `${prefix}_at1`);
        //         this._janitor.Add(at2, "Destroy", `${prefix}_at2`);
        //         this._janitor.Add(beam, "Destroy", `${prefix}_beam`);
        //         this._janitor.Add(smooth, "Destroy", `${prefix}_smooth`);
        //         this._janitor.Add(wind, "Destroy", `${prefix}_wind`);
        //         this._janitor.Add(windstyle, "Destroy", `${prefix}_windstyle`);
        //         this._janitor.Add(sound, "Destroy", `${prefix}_sound`);
        //     }),
        //     true,
        //     `${ownerId}_M1_swing`,
        // );

        // task.delay(timing.events.swingend - offsetTime, () => {
        //     this._janitor.Remove(`${prefix}_at1`);
        //     this._janitor.Remove(`${prefix}_at2`);
        //     this._janitor.Remove(`${prefix}_beam`);
        //     this._janitor.Remove(`${prefix}_smooth`);
        //     this._janitor.Remove(`${prefix}_wind`);
        //     this._janitor.Remove(`${prefix}_windstyle`);
        // });

        task.delay(timing.duration - offsetTime, () => {
            this._janitor.Remove(`${ownerId}_animation_Check`);
        });
    }
}
