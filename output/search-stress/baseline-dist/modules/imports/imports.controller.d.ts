import { ImportsService, type ImportResponse } from './imports.service';
export declare class ImportsController {
    private readonly importsService;
    constructor(importsService: ImportsService);
    run(): Promise<ImportResponse>;
}
