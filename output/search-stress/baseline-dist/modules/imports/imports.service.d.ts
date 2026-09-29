export interface ImportResponse {
    status: 'completed';
    report: unknown;
}
export declare class ImportsService {
    private readonly logger;
    private isRunning;
    run(): Promise<ImportResponse>;
    private findImportScript;
    private runScript;
}
