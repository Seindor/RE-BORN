import { Phase, SolverNumber, SolverProperties } from "../Types/SolverTypes";
import { Calculator as _Calculator } from "../Components/Calculator";
import { TableHelper } from "shared/Utilities/TableHelper";

export class SolverAggregate {
    private calculator = new _Calculator();

    public name: string;
    public phases: Phase[];
    public tags: string[];
    public solverNumbers: SolverNumber[] = [];
    public miscData: Record<string, any> = {};

    constructor(properties: SolverProperties) {
        this.name = properties.solverName ?? "Unknown Solver";
        this.phases = properties.phases ?? [];
        this.tags = properties.tags ?? [];
    }

    public AddSolverNumber(solverNumber: SolverNumber) {
        const phase = this.phases.find((_phase) => _phase.name === solverNumber.phaseName);
        if (!phase) {
            warn(`Cannot find Phase: ${solverNumber.phaseName} in ${this.name}`);
            return;
        }

        const exist = this.solverNumbers.find(
            (_number) => _number.sourceId === solverNumber.sourceId,
        );

        if (!exist) {
            this.solverNumbers.push(solverNumber);
        } else {
            warn(`${solverNumber.sourceId} already exists on ${this.name} SolverNumbers.`);
        }
    }

    public SetSolverNumber(solverNumber: SolverNumber) {
        const phase = this.phases.find((_phase) => _phase.name === solverNumber.phaseName);
        if (!phase) {
            warn(`Cannot find Phase: ${solverNumber.phaseName} in ${this.name}`);
            return;
        }

        const index = this.solverNumbers.findIndex(
            (_number) => _number.sourceId === solverNumber.sourceId,
        );

        if (index === -1) {
            this.solverNumbers.push(solverNumber);
            return;
        }

        this.solverNumbers[index] = solverNumber;
    }

    public RemoveSolverNumber(sourceId: string) {
        const index = this.solverNumbers.findIndex((_number) => _number.sourceId === sourceId);
        if (index === -1) return;

        this.solverNumbers.remove(index);
    }

    public CalculateValue(baseValue: number): number {
        const valuesByPhase = this.GetValuesByPhase();
        const sortedPhases = [...this.phases].sort((a, b) => a.priority < b.priority);

        let current = baseValue;

        for (const phase of sortedPhases) {
            const values = valuesByPhase.get(phase.name);
            if (!values || values.size() === 0) continue;

            current = this.calculator.CalculatePhase(
                current,
                values,
                phase.algorithm,
                phase.subAlgorithm,
            );
        }

        return current;
    }

    private GetValuesByPhase(): Map<string, number[]> {
        const valuesByPhase = new Map<string, number[]>();

        for (const solverNumber of this.solverNumbers) {
            const values = valuesByPhase.get(solverNumber.phaseName);

            if (values) {
                values.push(solverNumber.value);
                continue;
            }

            valuesByPhase.set(solverNumber.phaseName, [solverNumber.value]);
        }

        return valuesByPhase;
    }

    public Destroy() {
        TableHelper.ClearTable(this);
    }
}
