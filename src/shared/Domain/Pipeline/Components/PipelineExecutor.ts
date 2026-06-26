// ─────────────────────────────────────────────
//  Pipeline / Components / PipelineExecutor.ts
// ─────────────────────────────────────────────

import type { PipelineContext } from "../Aggregates/PipelineContext";
import type { IPipelineStep, PipelineContextData } from "../Types/PipelineTypes";

/**
 * Последовательно выполняет шаги.
 *
 * Если Execute бросает исключение — оно всплывает наверх и PipelineAggregate
 * вызывает OnError, после чего останавливает выполнение.
 */
export class PipelineExecutor {
    public Execute<TContext extends PipelineContextData>(
        ctx: PipelineContext<TContext>,
        steps: IPipelineStep<TContext>[],
    ): void {
        for (const step of steps) {
            ctx.Log(`→ ${step.Id}`);
            step.Execute(ctx);
        }
    }
}
