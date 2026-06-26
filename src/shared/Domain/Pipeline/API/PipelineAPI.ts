// ─────────────────────────────────────────────
//  Pipeline / API / PipelineAPI.ts
// ─────────────────────────────────────────────

import { PipelineService } from "../Services/PipelineService";
import { PipelineAggregate } from "../Aggregates/PipelineAggregate";

import type { PipelineContextData, PipelineToken } from "../Types/PipelineTypes";

/**
 * Публичный фасад системы пайплайнов.
 *
 * Единственная точка входа — через него Application запускает пайплайны.
 *
 * @example
 * ```ts
 * // В конструкторе сервиса (Flamework DI):
 * constructor(private readonly pipelineAPI: PipelineAPI) {}
 *
 * // В onStart:
 * Players.PlayerAdded.Connect((player) => {
 *     this.pipelineAPI.Run<PlayerContext>("Player", {
 *         id: tostring(player.UserId),
 *         player,
 *     });
 * });
 * ```
 */
export class PipelineAPI {
    private readonly service: PipelineService;

    constructor(service?: PipelineService) {
        this.service = service ?? new PipelineService();
    }

    // ── получить / создать ───────────────────────────────────────────────────

    public Get<TContext extends PipelineContextData>(
        nameOrToken: string | PipelineToken<TContext>,
    ): PipelineAggregate<TContext> | undefined {
        return this.service.Get<TContext>(this.resolveName(nameOrToken));
    }

    public GetOrCreate<TContext extends PipelineContextData>(
        nameOrToken: string | PipelineToken<TContext>,
    ): PipelineAggregate<TContext> {
        return this.service.GetOrCreate<TContext>(this.resolveName(nameOrToken));
    }

    // ── удобный шорткат: получить и сразу запустить ──────────────────────────

    /**
     * Создаёт пайплайн (если ещё не существует) и запускает его для данных.
     * Возвращает PipelineContext — можно читать результаты.
     *
     * @example
     * ```ts
     * const ctx = this.pipelineAPI.Run<PlayerContext>("Player", {
     *     id: tostring(player.UserId),
     *     player,
     * });
     * const dataHandler = ctx.Get<DataHandler>("DataHandler");
     * ```
     */
    public Run<TContext extends PipelineContextData>(
        nameOrToken: string | PipelineToken<TContext>,
        data: TContext,
    ) {
        const pipeline = this.service.GetOrCreate<TContext>(this.resolveName(nameOrToken));
        return pipeline.Run(data);
    }

    // ── управление ──────────────────────────────────────────────────────────

    public Has(nameOrToken: string | PipelineToken<any>): boolean {
        return this.service.Has(this.resolveName(nameOrToken));
    }

    public Remove(nameOrToken: string | PipelineToken<any>): void {
        this.service.Remove(this.resolveName(nameOrToken));
    }

    public Clear(): void {
        this.service.Clear();
    }

    public GetAll(): ReadonlyMap<string, PipelineAggregate<any>> {
        return this.service.GetAll();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private resolveName(nameOrToken: string | PipelineToken<any>): string {
        return typeof nameOrToken === "string" ? nameOrToken : nameOrToken.Name;
    }
}
