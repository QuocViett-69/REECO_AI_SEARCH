"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("./database/supabase/supabase.module");
const admin_module_1 = require("./modules/admin/admin.module");
const embeddings_module_1 = require("./modules/embeddings/embeddings.module");
const health_module_1 = require("./modules/health/health.module");
const imports_module_1 = require("./modules/imports/imports.module");
const products_module_1 = require("./modules/products/products.module");
const search_module_1 = require("./modules/search/search.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            supabase_module_1.SupabaseModule,
            health_module_1.HealthModule,
            products_module_1.ProductsModule,
            admin_module_1.AdminModule,
            imports_module_1.ImportsModule,
            search_module_1.SearchModule,
            embeddings_module_1.EmbeddingsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map