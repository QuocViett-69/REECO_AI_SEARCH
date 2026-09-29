"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@reeco/shared");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const zod_validation_pipe_1 = require("../../common/pipes/zod-validation.pipe");
const products_service_1 = require("../products/products.service");
let AdminController = class AdminController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    list(query) {
        return this.productsService.listAdmin(query);
    }
    get(productId) {
        return this.productsService.getAdmin(productId);
    }
    update(productId, updates) {
        return this.productsService.updateAdmin(productId, updates);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(shared_1.ProductListQuerySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':productId'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "update", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin/products'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map