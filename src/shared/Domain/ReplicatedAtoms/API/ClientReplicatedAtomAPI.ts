// ─────────────────────────────────────────────
//  ReplicatedAtom / API / ClientReplicatedAtomAPI.ts
// ─────────────────────────────────────────────

import { ClientReplicatedAtomService } from "../Services/ClientReplicatedAtomService";
import type { Atom } from "@rbxts/charm";
import type { SyncPayload } from "../Types/ReplicatedAtomTypes";

/**
 * Клиентский фасад.
 *
 * @example
 * ```ts
 * // В OnStart:
 * ServerSignals.AtomSync.connect((payload) => {
 *     clientReplicatedAtomAPI.Receive(payload);
 * });
 *
 * // В Pipeline шаге:
 * clientReplicatedAtomAPI.WaitForChannel("PlayerData");
 *
 * // Подписаться:
 * const atom = clientReplicatedAtomAPI.GetAtom<SessionStatsState>("SessionStats");
 * subscribe(atom!, (state) => { ... });
 * ```
 */
export class ClientReplicatedAtomAPI {
    private readonly service: ClientReplicatedAtomService;

    constructor(service?: ClientReplicatedAtomService) {
        this.service = service ?? new ClientReplicatedAtomService();
    }

    public Receive(payload: SyncPayload): void {
        this.service.Receive(payload);
    }

    public WaitForChannel(name: string): void {
        this.service.WaitForChannel(name);
    }

    public IsReady(name: string): boolean {
        return this.service.IsReady(name);
    }

    public GetAtom<TState>(name: string): Atom<TState> | undefined {
        return this.service.GetAtom<TState>(name);
    }
}
