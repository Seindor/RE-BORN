import { AbilityAggregate } from "../Aggregates/AbilityAggregate";
import { IAbility, IAbilityType, IAbilityConfig, IAbilityBehaviour } from "../Types/AbilityTypes";

export class AbilityService {
    private readonly BlockedTags = new Map<string, IAbilityType[]>();
    private readonly Abilities = new Map<string, Map<string, AbilityAggregate>>();

    public initActor(id: string) {
        if (!this.Abilities.has(id)) {
            this.Abilities.set(id, new Map<string, AbilityAggregate>());
        }

        if (!this.BlockedTags.has(id)) {
            this.BlockedTags.set(id, []);
        }
    }

    private isBlockedByTag(id: string, tags: IAbilityType[]): boolean {
        const ownerId = id;

        const blockedTags = this.BlockedTags.get(ownerId);
        if (!blockedTags) return false;

        for (const abilityTag of tags) {
            for (const blockedTag of blockedTags) {
                if (abilityTag.name === blockedTag.name && blockedTag.level >= abilityTag.level) {
                    return true;
                }
            }
        }

        return false;
    }

    public AddBlockTags(id: string, tags: IAbilityType[]) {
        this.initActor(id);

        if (!this.BlockedTags.has(id)) {
            this.BlockedTags.set(id, []);
        }

        const entityTags = this.BlockedTags.get(id)!;

        for (const newTag of tags) {
            const existingIndex = entityTags.findIndex((t) => t.name === newTag.name);

            if (existingIndex !== -1) {
                if (newTag.level > entityTags[existingIndex].level) {
                    entityTags[existingIndex] = newTag;
                }
            } else {
                entityTags.push(newTag);
            }
        }
    }

    public GetBlockTag(id: string, tagName: string): IAbilityType | undefined {
        const entityTags = this.BlockedTags.get(id);
        if (!entityTags) return undefined;

        return entityTags.find((t) => t.name === tagName);
    }

    public GetBlockTags(id: string): IAbilityType[] {
        this.initActor(id);

        return this.BlockedTags.get(id)!;
    }

    public RemoveBlockTags(id: string, tags: string[] | "all") {
        this.initActor(id);
        const entityTags = this.BlockedTags.get(id);
        if (!entityTags) return;

        if (tags === "all") {
            this.BlockedTags.set(id, []);
            return;
        }

        this.BlockedTags.set(
            id,
            entityTags.filter((t) => !tags.includes(t.name)),
        );
    }

    public ValidateAbility(ability: AbilityAggregate): boolean {
        if (!this.Abilities.has(ability.config.ownerId)) {
            this.Abilities.set(ability.config.ownerId, new Map<string, AbilityAggregate>());
        }

        const ownerAbilities = this.Abilities.get(ability.config.ownerId)!;

        if (ownerAbilities.has(ability.config.name)) {
            return false;
        } else {
            ownerAbilities.set(ability.config.name, ability);
            return true;
        }
    }

    public Create(_config: IAbilityConfig, _behaviours: IAbilityBehaviour): AbilityAggregate {
        const ability = new AbilityAggregate(_config, _behaviours);
        this.initActor(_config.ownerId);
        const validate = this.ValidateAbility(ability);

        if (validate) {
            return ability;
        } else {
            const ownerAbilities = this.Abilities.get(ability.config.ownerId)!;
            const newAbility = ownerAbilities.get(ability.config.name);
            if (!newAbility) throw error("newAbility is undefined");
            ability.Destroy();
            return newAbility;
        }
    }

    public Get(ownerId: string, abilityName: string): AbilityAggregate | undefined {
        if (!this.Abilities.has(ownerId)) {
            warn(`${ownerId} is undefined on Abilities.`);
        }

        const ownerAbilities = this.Abilities.get(ownerId);

        if (!ownerAbilities?.has(abilityName)) {
            warn(`${abilityName} is undefined on ${ownerId} Abilities.`);
        }

        return ownerAbilities?.get(abilityName);
    }

    public GetAllAbilities(ownerId: string): Map<string, AbilityAggregate> | undefined {
        return this.Abilities.get(ownerId);
    }

    public Remove(ownerId: string, abilityName: string) {
        if (!this.Abilities.has(ownerId)) return;

        const ownerAbilities = this.Abilities.get(ownerId);

        if (!ownerAbilities?.has(abilityName)) return;

        ownerAbilities.delete(abilityName);
    }

    public Execute(
        ability: AbilityAggregate,
        callBackName: "Start" | "End",
        check: boolean,
        ...args: unknown[]
    ) {
        if (check) {
            const blocked = this.isBlockedByTag(ability.config.ownerId, ability.config.types);
            if (blocked) return;
        }

        ability.Execute(callBackName, check, ...args);
    }

    public Reject(ability: AbilityAggregate, ...args: unknown[]) {
        ability.Reject(...args);
    }
}
