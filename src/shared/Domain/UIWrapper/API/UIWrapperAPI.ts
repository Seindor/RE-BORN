import { UIButtonAggregate } from "../Aggregates/UIButtonAggregate";
import { UIFrameAggregate } from "../Aggregates/UIFrameAggregate";
import { UIWrapperService } from "../Services/UIWrapperService";
import { GUIButtonEventMap, GUIFrameEventMap } from "../Types/UIWrapperTypes";

export class UIWrapperAPI {
    public service = new UIWrapperService();

    public Create(instance: GuiObject): UIButtonAggregate | UIFrameAggregate {
        return this.service.Create(instance);
    }

    public Get(instance: GuiObject): UIButtonAggregate | UIFrameAggregate | undefined {
        return this.service.Get(instance);
    }

    public Remove(instance: GuiObject) {
        this.service.Remove(instance);
    }

    public GetAll(): (UIButtonAggregate | UIFrameAggregate)[] {
        return this.GetAll();
    }

    public Clear() {
        this.service.Clear();
    }

    public FixCanvas(scrollingFrame: ScrollingFrame, extraPadding?: number, axis: "X" | "Y" = "Y") {
        this.service.FixCanvas(scrollingFrame, extraPadding, axis);
    }
}
