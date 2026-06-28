// import { Players } from "@rbxts/services";
// import { Controller, Dependency, OnStart } from "@flamework/core";

// import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
// import { CompositionRootShared } from "shared/DI/CompositionRootShared";
// import { UIHandler } from "shared/Implementation/Handlers/UI/UIHandler";
// import { ClientAtomReplication } from "./ClientAtomReplication";
// import { Client_CharacterHandler } from "shared/Implementation/Handlers/Client_CharacterHandler";

// let sharedScope = CompositionRootShared.createScope();

// @Controller()
// export class ClientPlayerApplication implements OnStart {
//     public api = {
//         replicatedStatusEffectsAPI: sharedScope.resolve(
//             SharedRegistry.Singletons.API.ReplicatedStatusEffectsAPI,
//         ),
//         entitiesStorageAPI: sharedScope.resolve(SharedRegistry.Singletons.API.EntitiesStorageAPI),
//     };

//     public dependencies = {
//         characterHandler: Dependency<Client_CharacterHandler>(),
//     };

//     onStart(): void {
//         let player: Player = Players.LocalPlayer;
//         let playerStringUserId = tostring(player.UserId);

//         let atomReplication = Dependency<ClientAtomReplication>();

//         const initCharacter = (character: Model) => {
//             let entity = this.api.entitiesStorageAPI.AddEntity(playerStringUserId, character);
//             entity.AddTag("Player");
//             this.dependencies.characterHandler.Init(character);
//         };

//         if (player.Character) {
//             initCharacter(player.Character!);
//         }

//         player.CharacterAdded.Connect((character) => {
//             initCharacter(character);
//         });

//         this.api.replicatedStatusEffectsAPI.Set(tostring(player.UserId), []);

//         task.spawn(() => {
//             while (!atomReplication.loadedStates.dataAtom) {
//                 task.wait(0.1);
//             }

//             new UIHandler();
//         });
//     }
// }
