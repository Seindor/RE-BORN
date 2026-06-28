import { CreateControllerToken } from "shared/Domain/Runtime/Components/ControllerToken";
import type { HealthController } from "./Controllers/HealthController";

export const HealthControllerToken = CreateControllerToken<HealthController>("HealthController");
