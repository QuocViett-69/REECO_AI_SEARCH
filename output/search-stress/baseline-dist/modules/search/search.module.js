"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchModule = void 0;
const common_1 = require("@nestjs/common");
const supabase_module_1 = require("../../database/supabase/supabase.module");
const embeddings_module_1 = require("../embeddings/embeddings.module");
const products_module_1 = require("../products/products.module");
const explanation_service_1 = require("./explanation.service");
const hybrid_search_service_1 = require("./hybrid-search.service");
const keyword_search_service_1 = require("./keyword-search.service");
const reranker_service_1 = require("./reranker.service");
const search_score_service_1 = require("./search-score.service");
const search_controller_1 = require("./search.controller");
const search_service_1 = require("./search.service");
const semantic_search_service_1 = require("./semantic-search.service");
const technical_match_service_1 = require("./technical-match.service");
const technical_query_parser_service_1 = require("./technical-query-parser.service");
const technical_ranking_service_1 = require("./technical-ranking.service");
let SearchModule = class SearchModule {
};
exports.SearchModule = SearchModule;
exports.SearchModule = SearchModule = __decorate([
    (0, common_1.Module)({
        imports: [supabase_module_1.SupabaseModule, embeddings_module_1.EmbeddingsModule, products_module_1.ProductsModule],
        controllers: [search_controller_1.SearchController],
        providers: [
            search_service_1.SearchService,
            keyword_search_service_1.KeywordSearchService,
            semantic_search_service_1.SemanticSearchService,
            hybrid_search_service_1.HybridSearchService,
            search_score_service_1.SearchScoreService,
            technical_query_parser_service_1.TechnicalQueryParserService,
            technical_match_service_1.TechnicalMatchService,
            technical_ranking_service_1.TechnicalRankingService,
            reranker_service_1.RerankerService,
            explanation_service_1.ExplanationService,
        ],
    })
], SearchModule);
//# sourceMappingURL=search.module.js.map