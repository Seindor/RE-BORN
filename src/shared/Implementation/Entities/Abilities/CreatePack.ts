import { AbilityAggregate } from "shared/Domain/Ability/Aggregates/AbilityAggregate";
import { DefaultPack } from "./Default";

export type AbilityFactory = (ownerId: string) => AbilityAggregate;

export type AbilityEntry = {
    abilityName: string;
    key: string;
    priority: number;
    type: string;
    activatingType: "Manual" | "Signal";
    ability?: AbilityFactory;
};

export type AbilityPackDefinition = {
    name: string;
    abilities: Record<string, AbilityEntry>;
};

const PackRegistry = new Map<string, AbilityPackDefinition>([[DefaultPack.name, DefaultPack]]);

export type PackResult = Record<
    string,
    {
        abilityName: string;
        key: string;
        priority: number;
        type: string;
        activatingType: "Manual" | "Signal";
        ability?: AbilityAggregate;
    }
>;

export function CreatePack(packName: string, ownerId: string): PackResult {
    const pack = PackRegistry.get(packName);
    if (!pack) {
        warn(`Pack ${packName} not found`);
        return {};
    }

    const result: PackResult = {};

    for (const [name, entry] of pairs(pack.abilities)) {
        result[name as string] = {
            abilityName: entry.abilityName,
            key: entry.key,
            priority: entry.priority,
            activatingType: entry.activatingType,
            ability: entry.ability ? entry.ability(ownerId) : undefined,
            type: entry.type,
        };
    }

    return result;
}
