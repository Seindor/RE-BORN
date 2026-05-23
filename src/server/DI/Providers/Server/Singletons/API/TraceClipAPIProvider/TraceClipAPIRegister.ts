import { ServerRegistry } from "server/DI/Generated/ServerRegistry";
import type { Container } from "shared/DI/Container";
import { TraceClipAPI } from "server/Domain/TraceClip/API/TraceClipAPI";

export function register(container: Container) {
    container.bindSingleton(ServerRegistry.Singletons.API.TraceClipAPI, () => new TraceClipAPI());
}
