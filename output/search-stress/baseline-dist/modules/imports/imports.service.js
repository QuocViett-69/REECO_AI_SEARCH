"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ImportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsService = void 0;
const node_child_process_1 = require("node:child_process");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const common_1 = require("@nestjs/common");
let ImportsService = ImportsService_1 = class ImportsService {
    logger = new common_1.Logger(ImportsService_1.name);
    isRunning = false;
    async run() {
        if (this.isRunning) {
            throw new common_1.ConflictException('A product import is already running');
        }
        if (!process.env.DATABASE_URL) {
            throw new common_1.ServiceUnavailableException('DATABASE_URL is not configured for product imports');
        }
        const scriptPath = this.findImportScript();
        this.isRunning = true;
        try {
            const output = await this.runScript(scriptPath);
            let report;
            try {
                report = JSON.parse(output);
            }
            catch {
                report = { output };
            }
            return { status: 'completed', report };
        }
        catch (error) {
            this.logger.error(error instanceof Error ? error.message : 'Unknown import failure');
            throw new common_1.ServiceUnavailableException('Product import failed; inspect the API server logs for details');
        }
        finally {
            this.isRunning = false;
        }
    }
    findImportScript() {
        const pathSegments = [
            'scripts',
            'supabase',
            'import-data-foundation.mjs',
        ];
        const candidates = [
            (0, node_path_1.resolve)(process.cwd(), ...pathSegments),
            (0, node_path_1.resolve)(process.cwd(), '..', '..', ...pathSegments),
        ];
        const scriptPath = candidates.find((candidate) => (0, node_fs_1.existsSync)(candidate));
        if (!scriptPath) {
            throw new common_1.ServiceUnavailableException('The product import script is not available in this deployment');
        }
        return scriptPath;
    }
    runScript(scriptPath) {
        const projectRoot = (0, node_path_1.resolve)((0, node_path_1.dirname)(scriptPath), '..', '..');
        return new Promise((resolvePromise, rejectPromise) => {
            const child = (0, node_child_process_1.spawn)(process.execPath, [scriptPath], {
                cwd: projectRoot,
                env: process.env,
                shell: false,
                windowsHide: true,
            });
            let stdout = '';
            let stderr = '';
            child.stdout.setEncoding('utf8');
            child.stderr.setEncoding('utf8');
            child.stdout.on('data', (chunk) => {
                stdout += chunk;
            });
            child.stderr.on('data', (chunk) => {
                stderr += chunk;
            });
            child.on('error', rejectPromise);
            child.on('close', (code) => {
                if (code === 0)
                    resolvePromise(stdout.trim());
                else
                    rejectPromise(new Error(stderr.trim() || `Import exited ${code}`));
            });
        });
    }
};
exports.ImportsService = ImportsService;
exports.ImportsService = ImportsService = ImportsService_1 = __decorate([
    (0, common_1.Injectable)()
], ImportsService);
//# sourceMappingURL=imports.service.js.map