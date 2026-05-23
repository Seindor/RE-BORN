import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import { CompositionRootServer } from "server/DI/CompositionRootServer";

const ServerScope = CompositionRootServer.createScope();

const TracleClipAPI = ServerScope.resolve(ServerRegistry.Singletons.API.TraceClipAPI);
const GameEffectsAPI = ServerScope.resolve(ServerRegistry.Singletons.API.GameEffectsAPI);

import type {
    GameEffectsStepContext,
    GameEffect,
    GameEffectResult,
    StepType,
    GameEffectsLimitsOverride,
    GameEffectsLimitModifier,
} from "server/Domain/GameEffectsQueue/Types/GameEffectsQueueTypes";

type EmitFn = (effect: Omit<GameEffect, "order" | "stepId" | "stepType">) => void;

export interface StepRunParams {
    stepType: StepType;
    ownerId: string;
    sourceId?: string;
    targetId?: string;

    debugLabel?: string;

    limitsOverride?: GameEffectsLimitsOverride;
    limitModifiers?: GameEffectsLimitModifier[];
}

export interface StepRunResult {
    step: GameEffectsStepContext;
    results: GameEffectResult[];
    queued: number;
}

export class StepRunner {
    private nextStepIndex = 0;

    constructor(
        private gameEffects: typeof GameEffectsAPI,
        private trace: typeof TracleClipAPI,
    ) {}

    private newStepId(prefix: string) {
        this.nextStepIndex++;
        return `${prefix}#${tostring(os.clock())}#${this.nextStepIndex}`;
    }

    public Run(
        params: StepRunParams,
        seed: (emit: EmitFn, step: GameEffectsStepContext) => void,
    ): StepRunResult {
        const stepId = this.newStepId(params.debugLabel ?? "step");

        const step: GameEffectsStepContext = {
            stepId,
            stepType: params.stepType,

            ownerId: params.ownerId,
            sourceId: params.sourceId,
            targetId: params.targetId,

            limitsOverride: params.limitsOverride,
            limitModifiers: params.limitModifiers,
        };

        const queue = this.gameEffects.createStepQueue();

        this.trace.log(
            params.ownerId,
            "Step",
            `StepStart ${step.stepType}${params.debugLabel ? ` (${params.debugLabel})` : ""}`,
            {
                stepId,
                sourceId: params.sourceId,
                targetId: params.targetId,
            },
        );

        const emit: EmitFn = (effect) => {
            this.gameEffects.enqueue(step, queue, {
                ...effect,
            });
        };

        seed(emit, step);

        const results = this.gameEffects.flush(step, queue);

        this.trace.log(
            params.ownerId,
            "Step",
            `StepEnd ${step.stepType} executed=${results.size()}`,
            {
                stepId,
                sourceId: params.sourceId,
                targetId: params.targetId,
            },
        );

        return {
            step,
            results,
            queued: results.size(),
        };
    }
}
