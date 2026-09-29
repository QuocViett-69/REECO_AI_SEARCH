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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportsController = void 0;
const common_1 = require("@nestjs/common");
const supabase_auth_guard_1 = require("../../auth/supabase-auth.guard");
const imports_service_1 = require("./imports.service");
let ImportsController = class ImportsController {
    importsService;
    constructor(importsService) {
        this.importsService = importsService;
    }
    run() {
        return this.importsService.run();
    }
};
exports.ImportsController = ImportsController;
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImportsController.prototype, "run", null);
exports.ImportsController = ImportsController = __decorate([
    (0, common_1.Controller)('admin/import'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [imports_service_1.ImportsService])
], ImportsController);
//# sourceMappingURL=imports.controller.js.map