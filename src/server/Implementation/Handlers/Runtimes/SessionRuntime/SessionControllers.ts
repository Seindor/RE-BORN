import { RuntimeControllerMap } from "shared/Domain/Runtime/Types/RuntimeTypes";
import { HealthController } from "./Controllers/HealthController";

export interface SessionControllers extends RuntimeControllerMap {
    HealthController: HealthController;
}
