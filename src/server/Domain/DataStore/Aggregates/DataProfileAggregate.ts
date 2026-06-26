import type { DataTemplateName } from "shared/Types/Database/DataStoreTypes";

type TableKey = string | number;
type UnknownTable = Record<TableKey, unknown>;

export interface ProfileLike<TData> {
    Data: TData;

    Reconcile(): void;
    EndSession(): void;
    AddUserId(userId: number): void;

    OnSessionEnd: RBXScriptSignal;
}

export type TemplateResolver = (templateName: DataTemplateName) => unknown;

export class DataProfileAggregate<TData> {
    public readonly storeName: string;
    public readonly key: string;
    public readonly templateName: DataTemplateName;

    private readonly profile: ProfileLike<TData>;
    private readonly wipeHandler: () => boolean;
    private readonly removeFromCacheHandler: () => void;
    private readonly templateResolver: TemplateResolver;

    private active = true;

    public constructor(
        storeName: string,
        key: string,
        templateName: DataTemplateName,
        profile: ProfileLike<TData>,
        wipeHandler: () => boolean,
        removeFromCacheHandler: () => void,
        templateResolver: TemplateResolver,
    ) {
        this.storeName = storeName;
        this.key = key;
        this.templateName = templateName;

        this.profile = profile;
        this.wipeHandler = wipeHandler;
        this.removeFromCacheHandler = removeFromCacheHandler;
        this.templateResolver = templateResolver;
    }

    public GetData(): TData {
        return this.profile.Data;
    }

    public Reconcile(templateName?: DataTemplateName) {
        const selectedTemplateName = templateName ?? this.templateName;
        const template = this.templateResolver(selectedTemplateName) as TData;

        this.profile.Reconcile();
        this.DeepReconcile(this.profile.Data, template);
    }

    private DeepReconcile(target: unknown, template: unknown) {
        if (!typeIs(target, "table") || !typeIs(template, "table")) {
            return;
        }

        const targetTable = target as UnknownTable;
        const templateTable = template as UnknownTable;

        for (const [key, templateValue] of pairs(templateTable)) {
            const tableKey = key as TableKey;
            const targetValue = targetTable[tableKey];

            if (targetValue === undefined) {
                targetTable[tableKey] = this.DeepTableClone(templateValue);
                continue;
            }

            if (typeIs(targetValue, "table") && typeIs(templateValue, "table")) {
                this.DeepReconcile(targetValue, templateValue);
            }
        }
    }

    private DeepTableClone<T>(value: T): T {
        if (!typeIs(value, "table")) {
            return value;
        }

        const clonedTable = {} as UnknownTable;
        const valueTable = value as UnknownTable;

        for (const [key, childValue] of pairs(valueTable)) {
            const tableKey = key as TableKey;

            clonedTable[tableKey] = this.DeepTableClone(childValue);
        }

        return clonedTable as T;
    }

    public AddUserId(userId: number) {
        this.profile.AddUserId(userId);
    }

    public OnSessionEnd(callback: () => void) {
        return this.profile.OnSessionEnd.Connect(callback);
    }

    public IsActive(): boolean {
        return this.active;
    }

    public Release() {
        if (!this.active) return;

        this.active = false;
        this.removeFromCacheHandler();
        this.profile.EndSession();
    }

    public Wipe(): boolean {
        if (this.active) {
            this.Release();
        }

        return this.wipeHandler();
    }
}
