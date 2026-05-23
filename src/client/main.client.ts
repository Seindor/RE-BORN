import { Flamework } from "@flamework/core";
import Shatterbox = require("@kunosyn/shatterbox");

Flamework.addPaths("src/shared/Application");
Flamework.addPaths("src/shared/Implementation");

const shatterbox = new Shatterbox();
shatterbox.Start();

Flamework.ignite();
