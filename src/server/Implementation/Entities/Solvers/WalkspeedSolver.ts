import { SharedRegistry } from "shared/DI/Generated/SharedRegistry";
import { CompositionRootShared } from "shared/DI/CompositionRootShared";
import { SoundsUtil } from "shared/Utilities/SoundsUtil";
import { SolverAggregate } from "shared/Domain/NumbersSolver/Aggregates/SolverAggregate";

const SharedScope = CompositionRootShared.createScope();

const SolverAPI = SharedScope.resolve(SharedRegistry.Singletons.API.SolverAPI);

export function WalkspeedSolver(solverId: string): SolverAggregate {
    let walkspeedSolver = SolverAPI.CreateSolver({
        solverName: `Walkspeed_Solver_${solverId}`,
        phases: [
            {
                name: "Flat",
                algorithm: "Flat",
                subAlgorithm: "Add",
                priority: 1,
            },

            {
                name: "Multiplier",
                algorithm: "Expression_Add",
                subAlgorithm: "Multiply",
                priority: 2,
            },

            {
                name: "Override",
                algorithm: "Expression_Add",
                subAlgorithm: "Multiply",
                priority: 999,
            },
        ],
    });
    return walkspeedSolver;
}
