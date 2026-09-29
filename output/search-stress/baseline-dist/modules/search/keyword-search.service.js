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
var KeywordSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordSearchService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../database/supabase/supabase.service");
let KeywordSearchService = KeywordSearchService_1 = class KeywordSearchService {
    supabase;
    logger = new common_1.Logger(KeywordSearchService_1.name);
    constructor(supabase) {
        this.supabase = supabase;
    }
    async search(query, limit) {
        const { data, error } = await this.supabase
            .getClient()
            .rpc('search_products_keyword', {
            query_text: query,
            result_limit: limit,
        });
        if (error)
            this.throwQueryError(error);
        return (data ?? []);
    }
    throwQueryError(error) {
        this.logger.error(`keyword search failed: ${error.message}`);
        throw new common_1.ServiceUnavailableException('Keyword search is temporarily unavailable');
    }
};
exports.KeywordSearchService = KeywordSearchService;
exports.KeywordSearchService = KeywordSearchService = KeywordSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], KeywordSearchService);
//# sourceMappingURL=keyword-search.service.js.map