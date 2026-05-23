export interface PhaseResolverContext {
    miscData: Map<string, unknown>;
}

export interface PhaseResolverPhase<TContext extends PhaseResolverContext> {
    name: string;
    priority: number;

    onCheck: (ctx: TContext) => boolean;
    onSuccess: (ctx: TContext) => void;
    onRejected?: (ctx: TContext) => void;

    [key: string]: unknown;
}

export interface PhaseResolverProperties<TContext extends PhaseResolverContext> {
    ownerId: string;
    resolverName: string;
    phases?: PhaseResolverPhase<TContext>[];
}

export interface PhaseResolverResult<TContext extends PhaseResolverContext> {
    resolved: boolean;
    phaseName: string | undefined;
    context: TContext;
}
