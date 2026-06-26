// ─────────────────────────────────────────────
//  Pipeline / Aggregates / PipelineContext.ts
// ─────────────────────────────────────────────

import type { PipelineContextData } from "../Types/PipelineTypes";

/**
 * Контекст одного запуска пайплайна.
 *
 * Хранит:
 *  - Data      — типизированные входные данные (id, player, …)
 *  - values    — runtime-хранилище промежуточных объектов (Set / Get / Require)
 *  - logs      — лог выполнения
 *
 * После завершения всех шагов контекст блокируется — попытка
 * записать в него что-либо бросит ошибку.
 */
export class PipelineContext<TContext extends PipelineContextData> {
    /** Типизированные входные данные */
    public readonly Data: TContext;

    private readonly values = new Map<string, unknown>();
    private readonly logs: string[] = [];

    private _locked = false;
    private _executed = false;

    constructor(data: TContext) {
        this.Data = data;
    }

    // ── runtime storage ──────────────────────────────────────────────────────

    public Set<T>(key: string, value: T): this {
        if (this._locked) error(`[PipelineContext] Locked — cannot Set("${key}")`);
        this.values.set(key, value);
        return this;
    }

    public Get<T>(key: string): T | undefined {
        return this.values.get(key) as T | undefined;
    }

    /** Получить значение или бросить ошибку, если его нет */
    public Require<T>(key: string): T {
        const v = this.values.get(key);
        if (v === undefined) error(`[PipelineContext] Required key "${key}" not found`);
        return v as T;
    }

    public Has(key: string): boolean {
        return this.values.has(key);
    }

    public Delete(key: string): this {
        if (this._locked) error(`[PipelineContext] Locked — cannot Delete("${key}")`);
        this.values.delete(key);
        return this;
    }

    public GetValues(): ReadonlyMap<string, unknown> {
        return this.values;
    }

    // ── logging ──────────────────────────────────────────────────────────────

    public Log(message: string): void {
        const line = `[Pipeline:${this.Data.id}] ${message}`;
        this.logs.push(line);
        print(line);
    }

    public Warn(message: string): void {
        const line = `[Pipeline:${this.Data.id}] WARN ${message}`;
        this.logs.push(line);
        warn(line);
    }

    public GetLogs(): readonly string[] {
        return this.logs;
    }

    // ── lifecycle ────────────────────────────────────────────────────────────

    /** @internal вызывается PipelineAggregate после завершения */
    public _markExecuted(): void {
        this._executed = true;
    }

    /** @internal блокирует запись после завершения */
    public _lock(): void {
        this._locked = true;
    }

    public isExecuted(): boolean {
        return this._executed;
    }

    public isLocked(): boolean {
        return this._locked;
    }
}
