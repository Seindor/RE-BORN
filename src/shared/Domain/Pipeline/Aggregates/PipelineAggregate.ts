// ─────────────────────────────────────────────
//  Pipeline / Aggregates / PipelineAggregate.ts
// ─────────────────────────────────────────────

import { PipelineContext } from "./PipelineContext";
import { PipelineSorter } from "../Components/PipelineSorter";
import { PipelineValidator } from "../Components/PipelineValidator";
import { PipelineExecutor } from "../Components/PipelineExecutor";

import type {
    IPipelineStep,
    PipelineContextData,
    PipelineProperties,
} from "../Types/PipelineTypes";

/**
 * Хранит шаги и запускает их.
 *
 * Run() можно вызывать МНОГО РАЗ — каждый вызов создаёт свой PipelineContext.
 * Сортировка пересчитывается только когда изменяется состав шагов (dirty-флаг).
 */
export class PipelineAggregate<TContext extends PipelineContextData> {
    public readonly Name: string;

    private readonly sorter = new PipelineSorter();
    private readonly validator = new PipelineValidator();
    private readonly executor = new PipelineExecutor();

    private readonly steps: IPipelineStep<TContext>[] = [];
    private sorted: IPipelineStep<TContext>[] = [];
    private dirty = true;

    // ── lifecycle hooks (опционально) ────────────────────────────────────────
    public BeforeRun?: (ctx: PipelineContext<TContext>) => void;
    public AfterRun?: (ctx: PipelineContext<TContext>) => void;
    public OnError?: (err: unknown, ctx: PipelineContext<TContext>) => void;

    constructor(properties: PipelineProperties) {
        this.Name = properties.Name;
    }

    // ── регистрация шагов ────────────────────────────────────────────────────

    public Register(step: IPipelineStep<TContext>): this {
        if (this.steps.some((s) => s.Id === step.Id)) {
            error(`[Pipeline "${this.Name}"] Step "${step.Id}" already registered`);
        }
        this.steps.push(step);
        this.dirty = true;
        return this;
    }

    public Remove(id: string): this {
        const idx = this.steps.findIndex((s) => s.Id === id);
        if (idx !== -1) {
            this.steps.remove(idx);
            this.dirty = true;
        }
        return this;
    }

    public Has(id: string): boolean {
        return this.steps.some((s) => s.Id === id);
    }

    public Get(id: string): IPipelineStep<TContext> | undefined {
        return this.steps.find((s) => s.Id === id);
    }

    public GetSteps(): IPipelineStep<TContext>[] {
        return [...this.steps];
    }

    public StepCount(): number {
        return this.steps.size();
    }

    // ── запуск ───────────────────────────────────────────────────────────────

    /**
     * Запускает все шаги для переданных данных.
     * Возвращает PipelineContext — можно читать результаты.
     */
    public Run(data: TContext): PipelineContext<TContext> {
        const ctx = new PipelineContext<TContext>(data);

        if (this.dirty) {
            this.validator.Validate(this.steps);
            this.sorted = this.sorter.Sort(this.steps);
            this.dirty = false;
        }

        try {
            ctx.Log(`Pipeline "${this.Name}" started (${this.sorted.size()} steps)`);

            this.BeforeRun?.(ctx);
            this.executor.Execute(ctx, this.sorted);
            this.AfterRun?.(ctx);

            ctx.Log(`Pipeline "${this.Name}" finished`);
        } catch (err) {
            this.OnError?.(err, ctx);
            error(`[Pipeline "${this.Name}"] failed: ${err}`);
        }

        ctx._markExecuted();
        ctx._lock();

        return ctx;
    }

    public Destroy(): void {
        this.steps.clear();
        this.sorted = [];
        this.dirty = true;
    }
}
