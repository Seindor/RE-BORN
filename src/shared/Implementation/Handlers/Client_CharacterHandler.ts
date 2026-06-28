// import { Players } from "@rbxts/services";

// import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
// import { CompositionRootShared } from "shared/DI/CompositionRootShared";
// import { Controller, Dependency } from "@flamework/core";
// import { ClientAtomReplication } from "shared/Application/ClientAtomReplication";
// import { Client_MovementAnimations } from "./Client_MovementAnimations";
// import { Janitor } from "@rbxts/janitor";

// let sharedScope = CompositionRootShared.createScope();

// @Controller()
// export class Client_CharacterHandler {
//     public player = Players.LocalPlayer;
//     public playerStringUserId = tostring(this.player.UserId);
//     public character?: Model;
//     public _janitor = new Janitor<any>();

//     public api = {
//         eventBusAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EventBusAPI),
//         entitiesStorageAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI),
//     };

//     public buses = {
//         playerBus: this.api.eventBusAPI.New(this.playerStringUserId, "Player"),
//     };

//     public debris = new Map<string, any>();

//     public Init(character: Model) {
//         this.character = character;

//         this._janitor.Add(
//             character.AttributeChanged.Connect((attribute: string) => {
//                 if (attribute === "WalkSpeed") {
//                     let humanoid = character.WaitForChild("Humanoid") as Humanoid;

//                     humanoid.WalkSpeed = character.GetAttribute("WalkSpeed")! as number;
//                 }
//             }),
//             "Disconnect",
//             "WalkSpeedHandler",
//         );

//         task.spawn(() => {
//             if (!this.debris.has("Client_MovementAnimations")) {
//                 !this.debris.set("Client_MovementAnimations", new Client_MovementAnimations());
//             }
//             let client_MovementAnimations = this.debris.get(
//                 "Client_MovementAnimations",
//             ) as Client_MovementAnimations;
//             const atomReplication = Dependency<ClientAtomReplication>();
//             while (!atomReplication.loadedStates.dataAtom) {
//                 task.wait(0.1);
//             }

//             let data = atomReplication.GetLocalPlayerData()!;
//             let entity = this.api.entitiesStorageAPI.GetEntity(character)!;
//             entity.SetState(`CharacterName`, data.Equipment.Character.Name);

//             client_MovementAnimations.Init(this.playerStringUserId, character);

//             print("Client CharacterLoaded");
//             this.buses.playerBus.Fire("CharacterLoaded", undefined, true, this.character);
//         });
//     }
// }
