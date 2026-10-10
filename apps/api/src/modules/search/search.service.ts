import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  SearchResponseSchema,
  type SearchRequest,
  type SearchResponse,
  type ProductSearchDocument,
  type ProductSpecification,
} from '@reeco/shared';
import { configuration } from '../../config/configuration';
import { ProductsService } from '../products/products.service';
import { hasTechnicalConstraint, isExplanationQuestion, parseNegativeConstraints, resolveConversationQuery } from './conversation-query';
import { ExplanationService } from './explanation.service';
import {
  HybridSearchError,
  HybridSearchService,
  type HybridSearchCandidate,
  type HybridSearchMode,
} from './hybrid-search.service';
import { TechnicalMatchService } from './technical-match.service';
import { RerankerService } from './reranker.service';
import type { ParsedTechnicalQuery } from './technical-query-parser.service';
import { TechnicalQueryParserService } from './technical-query-parser.service';
import { buildSearchPlan, parseSearchIntent, matchSearchIntent } from './search-intent';
import {
  TechnicalRankingService,
  type TechnicalRankedCandidate,
} from './technical-ranking.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly configuredRetrievalLimit =
    configuration().search.retrievalLimit;

  constructor(
    private readonly hybridSearch: HybridSearchService,
    private readonly productsService: ProductsService,
    private readonly technicalQueryParser: TechnicalQueryParserService,
    private readonly technicalMatch: TechnicalMatchService,
    private readonly technicalRanking: TechnicalRankingService,
    private readonly reranker: RerankerService,
    private readonly explanation: ExplanationService,
  ) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const vi = /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu.test(request.query);
    if (isExplanationQuestion(request.query) && !request.context) {
      return SearchResponseSchema.parse({ query: request.query, mode: 'hybrid', results: [], guidance: {
        language: vi ? 'vi' : 'en', needs_clarification: true,
        text: vi ? 'Bạn đang hỏi về model nào và nhu cầu hoặc yêu cầu kỹ thuật nào? Nếu so sánh, hãy nêu cả hai model. Tôi cần thông tin này để giải thích dựa trên dữ liệu sản phẩm.' : 'Which model and application or technical requirements do you mean? For a comparison, provide both models. This information is needed for an evidence-based explanation.',
      } });
    }
    if (isExplanationQuestion(request.query) && request.context) {
      const ids = request.context.product_ids;
      const query = `${request.context.previous_query} ${request.query}`;
      const [evidence, summaries, catalog] = await Promise.all([
        this.productsService.getTechnicalEvidenceByIds(ids), this.productsService.getPublicSummariesByIds(ids),
        this.productsService.getActiveTechnicalIdentityCatalog(),
      ]);
      const parsed = this.technicalQueryParser.parse(query, catalog);
      const matches = await this.technicalMatch.evaluate(parsed, ids);
      const items = ids.flatMap(id => {
        const entry = evidence.get(id);
        return entry?.document && summaries.has(id) ? [{ document: entry.document, specifications: entry.specifications, match: matches.find(item => item.productId === id) }] : [];
      });
      const explanations = request.explain ? await this.explanation.explainMany(query, items) : [];
      const results = items.slice(0, request.limit).map((item, index) => {
        const product = summaries.get(item.document.product_id)!;
        return { product_id: product.product_id, model: product.model, name_en: product.name_en, name_vi: product.name_vi,
          category: product.category, device_type: product.device_type, image_url: product.image_url,
          matched_features: [], scores: { keyword: 0, semantic: null, hybrid: null, rerank: null }, ...(explanations[index] && { explanation: explanations[index] }) };
      });
      return SearchResponseSchema.parse({ query: request.query, resolved_query: request.context.previous_query, context_applied: true, mode: 'hybrid',
        results,
        guidance: { language: vi ? 'vi' : 'en', text: vi ? 'Đánh giá các model bạn đã chọn theo nhu cầu trước đó và câu hỏi mới. Các yêu cầu chưa được chứng minh được nêu riêng; chưa có căn cứ chọn model tốt hơn nếu thiếu tiêu chí so sánh.' : 'These explanations evaluate the selected models against your previous requirements and your new question. Unconfirmed requirements are identified separately; choosing a better model requires comparison criteria.' },
      });
    }
    const plan = request.context ? [] : buildSearchPlan(request.query);
    if (plan.length > 1) {
      const networkAlternatives = plan.every(component => ['Ethernet', 'Wi-Fi', 'cellular'].includes(component.label));
      const technical = this.technicalQueryParser.parse(request.query);
      const negative = parseNegativeConstraints(request.query);
      if (technical.protocols.some(protocol => !networkAlternatives || protocol !== 'Wi-Fi')
        || negative.unsupported || negative.exclusions.protocols.length
        || negative.exclusions.cellular || negative.exclusions.temperature
        || parseSearchIntent(request.query).specifications.length
        || technical.temperatureConstraints.some(item => item.intent !== 'operating' || item.confidence !== 'high' || item.kind === 'upper_bound')) {
        return SearchResponseSchema.parse({ query: request.query, mode: 'hybrid', results: [], guidance: {
          language: vi ? 'vi' : 'en', needs_clarification: true,
          text: vi ? `Với yêu cầu “${request.query}”, điều kiện kỹ thuật hoặc loại trừ áp dụng cho thành phần nào: cảm biến, bộ ghi hay thiết bị truyền thông? Hãy tìm riêng thành phần đó với đầy đủ điều kiện.` : `For “${request.query}”, which component must satisfy the technical requirement or exclusion: sensors, the data logger, or communication equipment? Search that component separately with its complete requirements.`,
        } });
      }
      const operating = technical.temperatureConstraints.filter(item => item.intent === 'operating' && item.confidence === 'high' && item.kind !== 'upper_bound');
      const operatingQuery = operating.map(item => `operates at ${item.kind === 'range' ? `${item.minCelsius} to ${item.maxCelsius}` : item.valueCelsius}°C`).join(' ');
      const details = [
        /alert|cảnh báo/iu.test(request.query) ? vi ? 'Cảnh báo cần cấu hình ngưỡng và nơi nhận.' : 'Alerts require thresholds and a destination.' : '',
        /months?|tháng|maintenance|bảo trì/iu.test(request.query) ? vi ? 'Tự vận hành dài ngày cần tính dung lượng lưu, điện năng và bảo trì.' : 'Long autonomous operation requires storage, energy and maintenance calculations.' : '',
        /peak|cực đại/iu.test(request.query) ? vi ? 'Ghi cực đại cần xác nhận tốc độ lấy mẫu và cấu hình xử lý của bộ ghi.' : 'Recording peaks requires confirming sampling rates and logger processing configuration.' : '',
        /zones|study|studying|relationship|khu vực|nghiên cứu|mối quan hệ|sau mỗi/iu.test(request.query) ? vi ? 'Cần bố trí điểm đo và ghi cùng mốc thời gian để so sánh các số đo.' : 'Sampling locations and synchronized records are needed to compare measurements.' : '',
        /off.grid|không có điện/iu.test(request.query) ? vi ? 'Nguồn ngoài lưới cần phương án cấp và dự trữ năng lượng; chưa có tính toán dung lượng pin hoặc nguồn tái tạo.' : 'Off-grid power requires an energy supply and storage plan; battery capacity or renewable power sizing remains unconfirmed.' : '',
        plan.some(component => component.needs_clarification) ? vi ? 'Cần làm rõ môi trường đo nhiệt độ trước khi chọn cảm biến nhiệt độ.' : 'Clarify the temperature measurement medium before selecting a temperature sensor.' : '',
        operating.length ? vi ? 'Đã kiểm tra yêu cầu nhiệt độ vận hành ở từng thành phần; nhóm không có model là chưa có ứng viên được xác nhận.' : 'Operating-temperature requirements were checked for each component; a group without models has no confirmed candidate.' : '',
      ].filter(Boolean).join(' ');
      // Small catalog-backed component searches; no invented compatibility between parts.
      const responses = await Promise.all(plan.map(component => component.needs_clarification
        ? Promise.resolve({ query: component.query, mode: 'hybrid' as const, results: [] })
        : this.search({ ...request, query: `${component.query} ${operatingQuery}`.trim(), limit: 2, explain: false })));
      const unique = new Map<string, SearchResponse['results'][number]>();
      for (let rank = 0; rank < 2; rank++) for (const response of responses) {
        const product = response.results[rank];
        if (product && !unique.has(product.product_id)) unique.set(product.product_id, product);
      }
      let results = [...unique.values()].slice(0, request.limit);
      if (request.explain && results.length) {
        const evidence = await this.productsService.getTechnicalEvidenceByIds(results.map(product => product.product_id));
        const matches = operating.length ? await this.technicalMatch.evaluate(technical, results.map(product => product.product_id)) : [];
        const items = results.flatMap(product => {
          const entry = evidence.get(product.product_id);
          const index = responses.findIndex(response => response.results.some(item => item.product_id === product.product_id));
          return entry?.document ? [{ document: entry.document, specifications: entry.specifications, match: matches.find(item => item.productId === product.product_id), query: `${plan[index]!.query} ${operatingQuery} ${vi ? 'tôi cần theo dõi' : 'I need monitoring'}` }] : [];
        });
        const generated = await this.explanation.explainMany(request.query, items);
        const byId = new Map(items.map((item, index) => [item.document.product_id, generated[index]]));
        results = results.map(product => ({ ...product, ...(byId.get(product.product_id) && { explanation: byId.get(product.product_id) }) }));
      }
      return SearchResponseSchema.parse({ query: request.query, mode: responses.every(response => response.mode === 'hybrid') ? 'hybrid' : responses[0]!.mode, results,
        guidance: { language: vi ? 'vi' : 'en', needs_clarification: plan.some(component => component.needs_clarification),
          text: networkAlternatives
            ? vi ? 'Đây là các lựa chọn thay thế, không cần mua cả ba. Ethernet cần mạng có dây; Wi-Fi cần mạng Wi-Fi tại trạm; cellular cần vùng phủ và dịch vụ mạng phù hợp. Chưa xác nhận hạ tầng, tương thích và điện năng cho trường hợp của bạn.' : 'These are alternatives; all three are not required. Ethernet needs a wired network, Wi-Fi needs a local Wi-Fi network, and cellular needs coverage and a compatible network service. Infrastructure, compatibility and power requirements remain unconfirmed.'
            : (vi ? 'Nhu cầu này cần phối hợp các thành phần bên dưới. Cảm biến đo, bộ ghi đọc/lưu dữ liệu, thiết bị truyền thông gửi dữ liệu đi. Đây là các ứng viên theo chức năng; chưa xác nhận tương thích, số kênh, nguồn cấp và điều kiện lắp đặt. Nếu chưa nêu đại lượng cần đo, hãy làm rõ trước khi chọn cảm biến.' : 'This use case requires the components below. Sensors measure, loggers read/store data, and communication equipment transfers it. These are candidates by role; compatibility, channel counts, power and installation conditions remain unconfirmed. Specify measurements before selecting sensors.') + (details ? ` ${details}` : ''),
          components: plan.map((component, index) => ({ ...component, models: responses[index]!.results.filter(p => results.some(result => result.product_id === p.product_id)).map(p => p.model) })),
        } });
    }
    try {
      return await this.searchOnce(request);
    } catch (error) {
      if (!(error instanceof ServiceUnavailableException)) throw error;
      // Search is read-only. One bounded retry covers transient database/retrieval failures.
      this.logger.warn('Search dependency unavailable; retrying once');
      return this.searchOnce(request);
    }
  }

  private async searchOnce(request: SearchRequest): Promise<SearchResponse> {
    const negative = parseNegativeConstraints(request.query);
    if (negative.unsupported) {
      throw new BadRequestException('Negative search constraints are not supported');
    }
    if (!negative.query && !request.context) {
      throw new BadRequestException('A positive search term is required with exclusions');
    }
    const resolution = negative.query
      ? resolveConversationQuery(negative.query, request.context)
      : { query: request.context?.previous_query ?? '', applied: !!request.context };
    const searchQuery = resolution.query;
    const intent = parseSearchIntent(searchQuery);
    const canonical = [...intent.measurements.map(item => `${item.en} sensor`), ...(intent.target ? [`${intent.target.en} sensor`] : []), ...intent.roles.map(item => item.en)];
    const retrievalQuery = resolution.applied && hasTechnicalConstraint(request.query)
      ? request.context!.base_query
      : canonical.length && !hasTechnicalConstraint(searchQuery) ? canonical.join(' ') : searchQuery;
    const retrievalLimit = Math.min(
      100,
      Math.max(1, this.configuredRetrievalLimit, request.limit),
    );
    let hybridResult: Awaited<ReturnType<HybridSearchService['search']>>;
    try {
      hybridResult = await this.hybridSearch.search(
        retrievalQuery,
        retrievalLimit,
      );
    } catch (error) {
      if (
        error instanceof HybridSearchError &&
        error.code === 'HYBRID_RETRIEVAL_FAILED'
      ) {
        throw new ServiceUnavailableException(
          'Search is temporarily unavailable',
        );
      }
      throw error;
    }

    let scopedCandidates = resolution.applied && request.context
      ? hybridResult.candidates.filter((candidate) =>
          request.context!.product_ids.includes(candidate.productId),
        )
      : hybridResult.candidates;

    let documents: Map<string, ProductSearchDocument> | undefined;
    let environmentalSpecifications = new Map<string, ProductSpecification[]>();
    const hasExclusions = negative.exclusions.protocols.length > 0 || negative.exclusions.cellular || negative.exclusions.temperature;
    if ((intent.constrained || intent.sensorOnly || hasExclusions) && scopedCandidates.length > 0) {
      const ids = scopedCandidates.map((item) => item.productId);
      [documents, environmentalSpecifications] = await Promise.all([
        this.productsService.getSearchDocumentsByIds(ids),
        intent.specifications.length > 0
          ? this.productsService.getTechnicalEvidenceByIds(ids).then(rows => new Map([...rows].map(([id, row]) => [id, row.specifications])))
          : intent.outdoor ? this.productsService.getEnvironmentalSpecificationsByIds(ids) : Promise.resolve(environmentalSpecifications),
      ]);
      scopedCandidates = scopedCandidates.filter((candidate) => {
        const document = documents!.get(candidate.productId);
        if (!document || matchSearchIntent(intent, document, environmentalSpecifications.get(candidate.productId)) === null) return false;
        if (/continuous|liên tục/iu.test(searchQuery) && /handheld/iu.test(document.taxonomy.device_type)) return false;
        const communicationOption = document.variants?.find((variant) => variant.model === document.model)
          ?.distinguishing_specifications.find((specification) => specification.name_en === 'Communication Option')?.value_raw;
        const cellular = /\b(?:cellular|lte|[345]g)\b/iu.test(document.taxonomy.device_type + ' ' + (document.supported_protocols ?? []).join(' '));
        const temperature = /temperature/iu.test(document.taxonomy.device_type + ' ' + (document.measurements ?? []).map((item) => item.key).join(' ') + ' ' + (document.capabilities ?? []).map((item) => item.key).join(' '));
        const excludedProtocol = negative.exclusions.protocols.some((protocol) => {
          if (protocol === 'Wi-Fi' && communicationOption && !/^wi[\s-]?fi$/iu.test(communicationOption)) return false;
          return (document.supported_protocols ?? []).some((supported) => protocol === 'Modbus'
            ? supported === 'Modbus' || supported.startsWith('Modbus ')
            : supported === protocol);
        });
        return !(excludedProtocol || negative.exclusions.cellular && cellular || negative.exclusions.temperature && temperature);
      });
    }

    if (scopedCandidates.length === 0) {
      const vi = /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu.test(request.query);
      return SearchResponseSchema.parse({
        query: request.query,
        ...(request.context && { resolved_query: searchQuery, context_applied: resolution.applied }),
        mode: this.mapMode(hybridResult.mode),
        results: [],
        guidance: this.noConfirmedMatchGuidance(vi),
      });
    }

    const identityCatalog =
      await this.productsService.getActiveTechnicalIdentityCatalog();
    const parsedQuery = this.technicalQueryParser.parse(
      searchQuery,
      identityCatalog,
    );
    const technicallyRankedCandidates = await this.applyTechnicalPolicy(
      parsedQuery,
      scopedCandidates,
    );
    const rankedCandidates = await this.reranker.rerank(
      searchQuery,
      parsedQuery,
      technicallyRankedCandidates,
    );

    const summaries = await this.productsService.getPublicSummariesByIds(
      rankedCandidates.map((ranked) => ranked.candidate.productId),
    );

    const identityCandidates = parsedQuery.identity
      ? rankedCandidates.filter(item => item.candidate.productId === parsedQuery.identity!.productId)
      : rankedCandidates;
    const results = identityCandidates
      .flatMap((ranked) => {
        const candidate = ranked.candidate;
        const product = summaries.get(candidate.productId);
        if (!product) return [];
        return [
          {
            product_id: product.product_id,
            model: product.model,
            name_en: product.name_en,
            name_vi: product.name_vi,
            category: product.category,
            device_type: product.device_type,
            image_url: product.image_url,
            matched_features: ranked.matchedFeatures,
            scores: this.mapScores(candidate, hybridResult.mode),
          },
        ];
      })
      .slice(0, request.limit);

    const vi = /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu.test(request.query);
    const comparisonText = intent.measurements.some(item => item.key === 'turbidity')
      ? vi ? 'Cảm biến độ đục đo mức độ đục của nước; cảm biến mực nước đo mức nước, không thay thế phép đo độ đục. Chọn theo đại lượng cần đo, rồi kiểm tra dải đo, giao tiếp và điều kiện lắp đặt.' : 'A turbidity sensor measures water turbidity; a water-level sensor measures level and does not replace turbidity measurement. Choose by the required variable, then check range, interface and installation conditions.'
      : vi ? 'Cảm biến độ ẩm đất cho biết tình trạng nước trong đất, trực tiếp hỗ trợ quyết định tưới. Cảm biến thời tiết đo điều kiện môi trường hoặc lượng mưa, chưa xác nhận lượng nước thực tế trong đất. Nếu cần phân tích quan hệ giữa mưa và ẩm đất, cần cả hai và ghi cùng thời gian.' : 'Soil-moisture sensors measure water in soil, directly informing irrigation decisions. Weather sensors measure environmental conditions or rainfall, which does not establish actual soil water content. Studying rainfall and soil moisture together requires both measurements and synchronized records.';

    return SearchResponseSchema.parse({
      query: request.query,
      ...(request.context && { resolved_query: searchQuery, context_applied: resolution.applied }),
      mode: this.mapMode(hybridResult.mode),
      ...(intent.comparison && { guidance: { language: vi ? 'vi' : 'en', text: comparisonText } }),
      // Technical policy or identity scoping can remove every candidate: same guidance as above
      ...(results.length === 0 && !intent.comparison && { guidance: this.noConfirmedMatchGuidance(vi) }),
      results: request.explain
        ? await this.withExplanations(searchQuery, parsedQuery, results, documents, environmentalSpecifications)
        : results,
    });
  }

  private noConfirmedMatchGuidance(vi: boolean) {
    return { language: vi ? 'vi' as const : 'en' as const, text: vi ? 'Chưa tìm thấy sản phẩm có dữ liệu xác nhận đồng thời toàn bộ yêu cầu. Điều này không chứng minh danh mục không có giải pháp. Hãy làm rõ đại lượng, model hoặc cho phép phối hợp nhiều thiết bị; dải nhiệt độ vận hành không xác nhận dải đo hay môi trường nước.' : 'No retrieved product has evidence confirming all requirements together. This does not establish that the catalog has no solution. Clarify measurements, models or whether multiple devices are acceptable; operating temperature does not establish measurement range or a water medium.', needs_clarification: true };
  }

  private async withExplanations(
    query: string,
    parsedQuery: ParsedTechnicalQuery,
    results: SearchResponse['results'],
    knownDocuments?: Map<string, ProductSearchDocument>,
    environmentalSpecifications = new Map<string, ProductSpecification[]>(),
  ): Promise<SearchResponse['results']> {
    if (results.length === 0) return results;
    const ids = results.map((item) => item.product_id);
    try {
      const [technicalEvidence, matches] = await Promise.all([
        this.productsService.getTechnicalEvidenceByIds(ids),
        this.hasApplicableTechnicalSignal(parsedQuery)
          ? this.technicalMatch.evaluate(parsedQuery, ids)
          : Promise.resolve([]),
      ]);
      const documents = knownDocuments ?? new Map([...technicalEvidence].flatMap(([id, entry]) => entry.document ? [[id, entry.document] as const] : []));
      const matchesById = new Map(matches.map((item) => [item.productId, item]));
      const explainable = results.flatMap((result) => {
        const document = documents.get(result.product_id);
        return document ? [{ productId: result.product_id, document, match: matchesById.get(result.product_id), specifications: technicalEvidence.get(result.product_id)?.specifications ?? environmentalSpecifications.get(result.product_id) }] : [];
      });
      const generated = await this.explanation.explainMany(query, explainable);
      const explanationsById = new Map(explainable.map((item, index) => [item.productId, generated[index]]));
      return results.map((result) => {
        const explanation = explanationsById.get(result.product_id);
        return explanation ? { ...result, explanation } : result;
      });
    } catch {
      this.logger.warn('Search explanations unavailable; returning ranked results');
      return results;
    }
  }

  private async applyTechnicalPolicy(
    parsedQuery: ParsedTechnicalQuery,
    candidates: HybridSearchCandidate[],
  ): Promise<TechnicalRankedCandidate[]> {
    if (!this.hasApplicableTechnicalSignal(parsedQuery)) {
      return this.technicalRanking.preserve(candidates);
    }
    const matches = await this.technicalMatch.evaluate(
      parsedQuery,
      candidates.map((candidate) => candidate.productId),
    );
    const allowed = new Set(matches.filter((match) =>
          match.protocolMatches.every((item) => item.result === 'MATCH') &&
          match.temperatureMatches
            .filter((item) => item.constraint.confidence === 'high')
            .every((item) => item.result === 'MATCH'),
        ).map((match) => match.productId));
    return this.technicalRanking.rank(
      candidates.filter((item) => allowed.has(item.productId)),
      matches,
    );
  }

  private hasApplicableTechnicalSignal(
    parsedQuery: ParsedTechnicalQuery,
  ): boolean {
    return (
      parsedQuery.confidence.identity === 'high' ||
      parsedQuery.confidence.protocol === 'high' ||
      parsedQuery.temperatureConstraints.some(
        (constraint) =>
          constraint.confidence === 'high' && constraint.intent !== 'ambiguous',
      )
    );
  }

  private mapMode(mode: HybridSearchMode): SearchResponse['mode'] {
    if (mode === 'keyword_fallback') return 'keyword';
    if (mode === 'semantic_fallback') return 'semantic';
    return 'hybrid';
  }

  private mapScores(
    candidate: HybridSearchCandidate,
    mode: HybridSearchMode,
  ): SearchResponse['results'][number]['scores'] {
    if (mode === 'keyword_fallback') {
      return {
        keyword: candidate.keywordScore ?? 0,
        semantic: null,
        hybrid: null,
        rerank: null,
      };
    }
    if (mode === 'semantic_fallback') {
      return {
        keyword: 0,
        semantic: candidate.semanticScore,
        hybrid: null,
        rerank: null,
      };
    }
    return {
      keyword: candidate.keywordScore ?? 0,
      semantic: candidate.semanticScore,
      hybrid: candidate.rrfScore,
      rerank: null,
    };
  }
}
