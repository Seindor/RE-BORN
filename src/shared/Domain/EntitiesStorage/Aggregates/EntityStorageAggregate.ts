import { ArrayHelper } from "shared/Utilities/ArrayHelper";

export class EntityStorageAggregate {
    public entity: unknown;
    public id: string;
    public tags = [] as string[];
    public miscData = new Map<string, any>();

    constructor(entity: any, id: string) {
        this.entity = entity;
        this.id = id;
    }

    public AddTag(tag: string, makeUnique = true as boolean) {
        ArrayHelper.addString(this.tags, tag, makeUnique);
    }

    public HasTag(tag: string): boolean {
        return ArrayHelper.has(this.tags, tag);
    }

    public RemoveTag(tag: string, makeUnique = true as boolean) {
        ArrayHelper.removeString(this.tags, tag, makeUnique);
    }
}
