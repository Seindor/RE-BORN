import { Flamework } from "@flamework/core";
import Shatterbox = require("@kunosyn/shatterbox");

Flamework.addPaths("src/server/Application");
Flamework.addPaths("src/server/Implementation");

const shatterbox = new Shatterbox();
shatterbox.Start();
shatterbox.RegisterOnVoxelDestruct(
    "BumpyFloorBreakWalls",
    shatterbox.DefaultEffects.BumpyFloorBreakWalls,
);

Flamework.ignite();
