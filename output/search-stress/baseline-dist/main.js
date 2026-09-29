"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    for (const envPath of [
        (0, node_path_1.resolve)(process.cwd(), '.env'),
        (0, node_path_1.resolve)(process.cwd(), 'apps', 'api', '.env'),
    ]) {
        if ((0, node_fs_1.existsSync)(envPath)) {
            process.loadEnvFile(envPath);
            break;
        }
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    if (process.env.LOCAL_STAGING_READ_ONLY === 'true') {
        app.use('/api/v1/admin', (request, response, next) => {
            if (['GET', 'HEAD', 'OPTIONS'].includes(request.method))
                return next();
            return response.status(403).json({ message: 'Local staging is read-only' });
        });
    }
    app.enableCors({
        origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
        credentials: true,
        allowedHeaders: ['Authorization', 'Content-Type'],
        methods: ['GET', 'POST', 'OPTIONS'],
    });
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port, process.env.HOST ?? '0.0.0.0');
}
void bootstrap();
//# sourceMappingURL=main.js.map