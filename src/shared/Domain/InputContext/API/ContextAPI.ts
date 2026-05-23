import { ContextAggregate } from "../Aggregates/ContextAggregate";
import { ContextService } from "../Services/ContextService";
import { ContextProperties } from "../Types/ContextTypes";

export class ContextAPI {
    private service = new ContextService();

    public CreateGroup(groupName: string, overwrite = false) {
        this.service.CreateGroup(groupName, overwrite);
    }

    public RemoveGroup(groupName: string) {
        this.service.RemoveGroup(groupName);
    }

    public GetActionName(groupName: string, contextName: string): string {
        return this.service.GetActionName(groupName, contextName);
    }

    public HasGroup(groupName: string) {
        this.service.HasGroup(groupName);
    }

    public HasContext(groupName: string, contextName: string) {
        this.service.HasContext(groupName, contextName);
    }

    public GetContext(groupName: string, contextName: string): ContextAggregate | undefined {
        return this.service.GetContext(groupName, contextName);
    }

    public BindAction(
        groupName: string,
        contextProperties: ContextProperties,
        overwrite = false,
    ): ContextAggregate {
        return this.service.BindAction(groupName, contextProperties, overwrite);
    }

    public BindActionAtPriority(
        groupName: string,
        contextProperties: ContextProperties,
        overwrite = false,
    ): ContextAggregate {
        return this.service.BindActionAtPriority(groupName, contextProperties, overwrite);
    }

    public UnbindAction(groupName: string, contextName: string) {
        this.service.UnbindAction(groupName, contextName);
    }

    public UnbindAllGroupActions(groupName: string) {
        this.service.UnbindAllGroupActions(groupName);
    }

    public UnbindAll() {
        this.service.UnbindAll();
    }

    public RefreshBoundInfo(groupName: string, contextName: string) {
        this.service.RefreshBoundInfo(groupName, contextName);
    }
}
