// ─────────────────────────────────────────────
//  ReplicatedAtom / Services / ClientReplicatedAtomService.ts
//
//  Клиентская сторона.
//  Принимает SyncPayload, раздаёт по каналам.
//  Lazy — syncer создаётся при первом получении.
// ─────────────────────────────────────────────

import { client } from "@rbxts/charm-sync";
import { SyncPayload } from "../Types/ReplicatedAtomTypes";
import { atom } from "@rbxts/charm";
import type { Atom } from "@rbxts/charm";

export class ClientReplicatedAtomService {
    private readonly atoms = new Map<string, Atom<unknown>>();
    private readonly syncers = new Map<string, ReturnType<typeof client>>();
    private readonly ready = new Map<string, boolean>();

    /**
     * Принять пакет с сервера.
     * Вызывается из RemoteEvent.OnClientEvent.
     */
    public Receive(payload: SyncPayload): void {
        const syncer = this.GetOrCreateSyncer(payload.channel);
        syncer.sync(payload.data as never);

        if (!this.ready.get(payload.channel)) {
            this.ready.set(payload.channel, true);
        }
    }

    /**
     * Ждёт пока канал придёт с сервера.
     * Использовать в Pipeline шагах.
     */
    public WaitForChannel(name: string): void {
        while (!this.ready.get(name)) {
            task.wait(0.05);
        }
    }

    public IsReady(name: string): boolean {
        return this.ready.get(name) === true;
    }

    /**
     * Получить atom конкретного канала.
     * Подписывайся через subscribe() из @rbxts/charm.
     */
    public GetAtom<TState>(name: string): Atom<TState> | undefined {
        return this.atoms.get(name) as Atom<TState> | undefined;
    }

    private GetOrCreateSyncer(name: string) {
        const existing = this.syncers.get(name);
        if (existing) return existing;

        const a = atom<unknown>({});
        this.atoms.set(name, a);

        const syncer = client({ atoms: { [name]: a } });
        this.syncers.set(name, syncer);

        return syncer;
    }
}
