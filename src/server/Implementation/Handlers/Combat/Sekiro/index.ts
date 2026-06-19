import { Default_Block_Effect } from "../Default/Effects/Default_Block";
import { Default_Dodge_Effect } from "../Default/Effects/Default_Dodge";
import { Default_M1_Damage_Effect } from "../Default/Effects/Default_M1_Damage";
import { Default_Parry_Effect } from "../Default/Effects/Default_Parry";
import { Default_M1_Resolver } from "../Default/Resolvers/Default_M1";

export const SekiroCombat = (ownerId: string) => {
    Default_M1_Resolver(ownerId);

    Default_M1_Damage_Effect(ownerId);
    Default_Parry_Effect(ownerId);
    Default_Block_Effect(ownerId);
    Default_Dodge_Effect(ownerId);
};
