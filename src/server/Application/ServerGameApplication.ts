import { Dependency, OnStart, Service } from "@flamework/core";
import { AccessoryQualityFixHandler } from "server/Implementation/Handlers/AccessoryQualityFixHandler";

@Service()
export class ServerGameApplication implements OnStart {
    onStart(): void {
        new AccessoryQualityFixHandler();
    }
}
