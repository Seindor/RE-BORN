import { Controller, OnStart } from "@flamework/core";
import { client } from "@rbxts/charm-sync";
import { Players } from "@rbxts/services";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";

import type { PlayerData } from "shared/Types/Database/PlayerData";
import { ClientSignals } from "shared/Implementation/Entities/ClientSignals";
import { StatusEffectsState } from "shared/Types/GlobalStatusEffectsTypes";

const sharedScope = CompositionRootShared.createScope();

type PlayersDataState = Record<string, PlayerData>;

@Controller()
export class ClientAtomReplication implements OnStart {
    private readonly atomAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AtomAPI);

    private readonly playersDataAtom = this.atomAPI.NewAtom<PlayersDataState>("PlayersData", {});
    private readonly statusEffectsAtom = this.atomAPI.NewAtom<StatusEffectsState>(
        "StatusEffects",
        {},
    );

    public loadedStates = {
        dataAtom: false,
    };

    private readonly syncer = client({
        atoms: {
            PlayersData: this.playersDataAtom.GetAtom(),
            StatusEffects: this.statusEffectsAtom.GetAtom(),
        },
    });

    public onStart(): void {
        ClientSignals.AtomSync.connect((payload) => {
            this.syncer.sync(payload);

            if (!this.loadedStates.dataAtom) {
                this.loadedStates.dataAtom = true;
                ClientSignals.AtomHydrated.fire();
            }
        });

        ClientSignals.RequestHydrate.fire();
    }

    public GetLocalPlayerAtom() {
        return this.playersDataAtom.For(Players.LocalPlayer.UserId);
    }

    public GetLocalPlayerRawAtom() {
        return this.playersDataAtom.GetAtom();
    }

    public GetLocalPlayerData(): PlayerData | undefined {
        return this.GetLocalPlayerAtom().GetRoot();
    }

    public GetStatusEffectsAtom() {
        return this.statusEffectsAtom;
    }
}
