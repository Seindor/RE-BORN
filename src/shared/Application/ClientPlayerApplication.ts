import { Controller, OnStart } from "@flamework/core";

import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { SessionStatsState } from "shared/Types/Replicators/SessionStats";
import { ClientSignals } from "shared/Implementation/Entities/ClientSignals";

const sharedScope = CompositionRootShared.createScope();

const clientAtomAPI = sharedScope.resolve(SharedRegistry.Singletons.API.ClientAtomAPI);

@Controller()
export class ClientPlayerApplication implements OnStart {
    onStart(): void {
        print("Client Init Started");

        ClientSignals.AtomSync.connect((payload) => {
            print("RECEIVED ATOM:", payload);
            clientAtomAPI.Receive(payload);
        });

        clientAtomAPI.WaitForChannel(`SessionStats`);
        ClientSignals.RequestHydrate.fire();
    }
}
