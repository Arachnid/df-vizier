import { ContractFunction } from "ethers";
import { DiagnosticUpdater } from "../Interfaces/DiagnosticUpdater";
export declare class ContractCaller {
    private diagnosticsUpdater?;
    private static readonly MAX_RETRIES;
    private readonly callQueue;
    makeCall<T>(contractViewFunction: ContractFunction<T>, args?: unknown[]): Promise<T>;
    setDiagnosticUpdater(diagnosticUpdater?: DiagnosticUpdater): void;
}
