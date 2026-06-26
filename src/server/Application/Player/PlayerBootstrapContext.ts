import { DataHandler } from "server/Implementation/Handlers/DataHandler";
import { ServerCharacterApplication } from "../Character/CharacterApplication";

export interface PlayerBootstrapContext {
    player: Player;
    id: string;

    dataHandler: DataHandler;
    characterHandler: ServerCharacterApplication;
}
