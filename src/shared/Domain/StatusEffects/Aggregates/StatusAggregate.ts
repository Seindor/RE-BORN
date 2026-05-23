import {
    IStatusStackBehavior,
    StackInstance,
    IStatusId as StatusId,
    IStatusStackingPolicy as StatusStackingPolicy,
} from "../Types/StatusTypes";

import { Stun } from "../Definations/Stun";
import {
    StatusAggregateType,
    StatusAggregateOptions,
    StatusDefinition,
    Modifier,
    BlacklistedStatus,
} from "../Types/StatusTypes";

import { Janitor } from "@rbxts/janitor";

const Definitions: Partial<Record<StatusId, StatusDefinition>> = {
    Stun: Stun,
};

const defaultStatusTemplate = (id: StatusId): StatusDefinition => ({
    id,
    defaultModifiers: [],
    stackingPolicy: "Replace",
});

export class StatusAggregate implements StatusAggregateType {
    readonly id: StatusId;
    public modifiers: Modifier[];

    public priority: number;
    public spawned: number;
    public duration: number;

    public stacks?: number;
    public maxStacks: number;
    public stackInstances?: StackInstance[];
    readonly stackingPolicy: StatusStackingPolicy;
    public stackBehavior?: IStatusStackBehavior;

    public tags?: string[];
    public miscData: Record<string, unknown> = {};

    public blacklist?: BlacklistedStatus[];
    public ignoreList?: BlacklistedStatus[];

    public _janitor: Janitor<any>;

    public onApply?: (actorId: string, statusAggregate?: StatusAggregate) => void;
    public onAdded?: (actorId: string, statusInstance?: StatusAggregate) => void;
    public onRemoved?: (actorId: string, statusInstance?: StatusAggregate) => void;
    public onCheck?: (actorId: string, statusInstance?: StatusAggregate) => boolean | void;

    constructor(statusId: StatusId, options?: StatusAggregateOptions) {
        const definition: StatusDefinition = Definitions[statusId]
            ? { ...Definitions[statusId] }
            : defaultStatusTemplate(statusId);

        this.id = definition.id;
        this.modifiers =
            options?.customModifiers ??
            (definition.defaultModifiers ? [...definition.defaultModifiers] : []);

        this.priority = options?.priority ?? 1;
        this.spawned = os.clock();
        this.duration = options?.duration ?? math.huge;

        this.stacks = options?.stacks ?? 1;
        this.maxStacks = options?.maxStacks ?? 1;
        this.stackInstances = options?.stackInstances ?? [];
        this.stackingPolicy = options?.stackingPolicy ?? definition.stackingPolicy ?? "Replace";
        this.stackBehavior = options?.stackBehavior ?? undefined;

        this.tags = [];
        this.miscData = {};

        this.blacklist = [...(definition.defaultBlacklist ?? []), ...(options?.blacklist ?? [])];
        this.ignoreList = [...(definition.defaultIgnorelist ?? []), ...(options?.ignoreList ?? [])];

        this._janitor = new Janitor();

        this.onApply = options?.onApply ?? definition.onApply ?? undefined;
        this.onAdded = options?.onAdded ?? definition.onAdded ?? undefined;
        this.onRemoved = options?.onRemoved ?? definition.onRemoved ?? undefined;
        this.onCheck = options?.onCheck ?? definition.onCheck ?? undefined;
    }

    apply(actorId: string) {
        this.onApply?.(actorId, this);
    }

    add(actorId: string) {
        this.onAdded?.(actorId, this);
    }

    remove(actorId: string) {
        this.onRemoved?.(actorId, this);
    }

    check(actorId: string): boolean {
        return this.onCheck?.(actorId, this) ?? true;
    }
}
