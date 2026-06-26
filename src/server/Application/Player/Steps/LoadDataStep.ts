import type { BootstrapStep } from "shared/Domain/Bootstrapper/Types/BootstrapTypes";
import type { PlayerBootstrapContext } from "../PlayerBootstrapContext";

export class LoadDataStep implements BootstrapStep<PlayerBootstrapContext> {
    public name = "LoadData";
    public priority = 1;

    public execute(ctx: PlayerBootstrapContext) {
        const ok = ctx.dataHandler.Load();

        if (!ok) {
            ctx.player.Kick("Data load failed");
        }
    }
}
