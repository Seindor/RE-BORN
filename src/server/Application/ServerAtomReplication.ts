import { OnStart, Service } from "@flamework/core";
import { server } from "@rbxts/charm-sync";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";

import type { PlayerData } from "shared/Types/Gameplay/PlayerData";
import { ServerSignals } from "shared/Implementation/Entities/SerrverSignals";
import { StatusEffectsState } from "shared/Types/GlobalStatusEffectsTypes";

const sharedScope = CompositionRootShared.createScope();

type PlayersDataState = Record<string, PlayerData>;

const PLAYER_LOAD_KEYS = ["dataLoaded", "clientLoaded"] as const;

type PlayerLoadKey = (typeof PLAYER_LOAD_KEYS)[number];
type PlayerLoadState = Record<PlayerLoadKey, boolean>;

@Service()
export class ServerAtomReplication implements OnStart {
    private readonly atomAPI = sharedScope.resolve(SharedRegistry.Singletons.API.AtomAPI);

    public playersDataAtom = this.atomAPI.NewAtom<PlayersDataState>("PlayersData", {});
    public statusEffectsAtom = this.atomAPI.NewAtom<StatusEffectsState>("StatusEffects", {});

    public playerStates = new Map<string, PlayerLoadState>();

    public syncer = server({
        atoms: {
            PlayersData: this.playersDataAtom.GetAtom(),
            StatusEffects: this.statusEffectsAtom.GetAtom(), // добавляем
        },
    });

    public onStart(): void {
        this.syncer.connect((player, payload) => {
            const id = tostring(player.UserId);
            if (!this.IsPlayerFullyReady(id)) return;

            ServerSignals.AtomSync.fire(player, payload);
        });

        ServerSignals.RequestHydrate.connect((player) => {
            this.SetFlag(player, "clientLoaded", true);
        });

        ServerSignals.AtomHydrated.connect((player) => {
            print("HydrateComplete");
        });
    }

    private EnsurePlayerState(id: string): PlayerLoadState {
        if (!this.playerStates.has(id)) {
            const state = {} as PlayerLoadState;

            for (const key of PLAYER_LOAD_KEYS) {
                state[key] = false;
            }

            this.playerStates.set(id, state);
        }

        return this.playerStates.get(id)!;
    }

    public GetPlayerState(id: string): PlayerLoadState | undefined {
        return this.playerStates.get(id);
    }

    public IsPlayerFullyReady(id: string): boolean {
        const state = this.playerStates.get(id);
        if (!state) return false;

        for (const key of PLAYER_LOAD_KEYS) {
            if (!state[key]) return false;
        }

        return true;
    }

    public SetFlag(player: Player, key: PlayerLoadKey, value: boolean): void {
        const id = tostring(player.UserId);
        const state = this.EnsurePlayerState(id);

        state[key] = value;

        this.TryHydrate(player);
    }

    public GetPlayersDataAtom() {
        return this.playersDataAtom;
    }

    public MarkDataLoaded(player: Player): void {
        this.SetFlag(player, "dataLoaded", true);
    }

    public UnregisterPlayer(player: Player): void {
        const id = tostring(player.UserId);

        this.playerStates.delete(id);
        this.playersDataAtom.Remove(id);
    }

    private TryHydrate(player: Player): void {
        const id = tostring(player.UserId);

        if (!this.IsPlayerFullyReady(id)) return;

        this.syncer.hydrate(player);
    }
}
