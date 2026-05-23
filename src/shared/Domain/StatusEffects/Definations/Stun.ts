import { StatusAggregateType, StatusDefinition } from "../Types/StatusTypes";

export const Stun: StatusDefinition = {
    id: "Stun",

    stackingPolicy: "Replace",

    defaultBlacklist: [{ id: "HyperArmor" }, { id: "iFrame" }],

    defaultModifiers: [
        { stat: "WalkSpeed", type: "Override", value: 0 },
        { stat: "JumpPower", type: "Override", value: 0 },
    ],

    onAdded: (actorId: string, statusInstance?: StatusAggregateType) => {
        warn("Stunned", actorId, "for", statusInstance?.duration || math.huge);
    },
    onRemoved: (actorId: string, statusInstance?: StatusAggregateType) => {
        print("Stun removed.");
    },
    onCheck: (actorId: string, statusInstance?: StatusAggregateType) => {},
};
