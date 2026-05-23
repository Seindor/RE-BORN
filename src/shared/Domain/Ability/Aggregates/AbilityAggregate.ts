import { RunService } from "@rbxts/services";

import {
    IAbility,
    IAbilityBehaviour,
    IAbilityBlacklist,
    IAbilityConfig,
    IAbilityStates,
    IStatusId,
} from "../Types/AbilityTypes";

import { Janitor } from "@rbxts/janitor";
import { TableHelper } from "shared/Utilities/TableHelper";
import { ArrayHelper } from "shared/Utilities/ArrayHelper";

export class AbilityAggregate implements IAbility {
    readonly config: IAbilityConfig;
    readonly behaviours: IAbilityBehaviour;
    public _janitor = new Janitor<any>();

    constructor(_config: IAbilityConfig, _behaviours: IAbilityBehaviour) {
        this.config = _config;
        this.behaviours = _behaviours;
    }

    private validateDuration(check: boolean) {
        const validateDurationConnection = RunService.Heartbeat.Connect(() => {
            const now = os.clock();
            if (this.HasState("Pressed")) {
                const elapsed = now - (this.config.lastUsed ?? 0);
                if (elapsed >= this.config.duration) {
                    this.RemoveState("Active");
                    this.Execute("End", check);
                    this._janitor.Remove("validateDuration");
                }
            } else {
                const elapsed = now - (this.config.lastUsed ?? 0);
                if (elapsed >= this.config.minDuration) {
                    this.RemoveState("Active");
                    this.Execute("End", check);
                    this._janitor.Remove("validateDuration");
                }
            }
        });

        this._janitor.Add(validateDurationConnection, "Disconnect", "validateDuration");
    }

    private validateCooldown() {
        const connection = RunService.Heartbeat.Connect(() => {
            const oncd = this.OnCooldown();
            if (!oncd) {
                this.RemoveState("Cooldown");
                this._janitor.Remove("validateCooldown");
            }
        });

        this._janitor.Add(connection, "Disconnect", "validateCooldown");
    }

    private validateAbility(check: boolean): boolean {
        if (check) {
            if (this.HasState("Locked") || this.HasState("Active")) return false;

            if (this.HasState("Cooldown")) {
                return false;
            }

            return true;
        } else return true;
    }

    public AddState(state: IAbilityStates) {
        ArrayHelper.addString(this.config.states, state, true);
    }

    public RemoveState(state: IAbilityStates) {
        ArrayHelper.removeString(this.config.states, state, true);
    }

    public HasState(state: IAbilityStates) {
        return ArrayHelper.has(this.config.states, state);
    }

    public AddTag(tag: string) {
        if (!this.config.tags) {
            this.config.tags = [];
        }

        if (!this.config.tags.includes(tag)) {
            this.config.tags.push(tag);
        }
    }

    public RemoveTag(tag: string) {
        if (!this.config.tags) return;

        const index = this.config.tags.indexOf(tag);
        if (index !== -1) {
            this.config.tags.remove(index);
        }
    }

    public HasTag(tag: string): boolean {
        return this.config.tags?.includes(tag) ?? false;
    }

    public GetTags(): string[] {
        return this.config.tags ?? [];
    }

    public GetBlacklist(): IStatusId[] {
        const global = IAbilityBlacklist;
        const additional = this.config.additionalBlacklist ?? [];

        return [...global, ...additional];
    }

    public Execute(callBackName: "Start" | "End", check: boolean, ...args: unknown[]) {
        if (!this.validateAbility(check)) return;

        this.RemoveState("Idle");
        this.config.lastUsed = os.clock();

        if (callBackName === "Start") {
            this.AddState("Active");
            this.validateDuration(check);
        } else {
            this.AddState("Cooldown");
            this.validateCooldown();
        }

        if (check) {
            if (this.behaviours[`on${callBackName}Check`](...args) === true) {
                this.behaviours[`on${callBackName}`](...args);
            } else {
                this.behaviours.onReject?.(...args);
            }
        } else this.behaviours[`on${callBackName}`](...args);
    }

    public Interrupt(...args: unknown[]) {
        this.RemoveState("Active");
        this.RemoveState("Pressed");

        this.behaviours.onInterrupt(...args);
    }

    public Reject(...args: unknown[]) {
        this.behaviours.onReject?.(...args);
    }

    public IsActive() {
        return this.HasState("Active");
    }

    public OnCooldown(): boolean {
        const now = os.clock();
        if (now - this.config.lastUsed <= this.config.cooldown) {
            return true;
        } else {
            return false;
        }
    }

    public Destroy() {
        this._janitor.Cleanup();
        TableHelper.ClearTable(this);
    }
}
