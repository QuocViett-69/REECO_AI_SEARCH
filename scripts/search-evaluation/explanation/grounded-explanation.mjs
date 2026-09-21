import { normalizeQuery } from '../retrieval/query-normalizer.mjs';

export const EVIDENCE_VERSION = 'grounded-evidence-v1';
export const TEMPLATE_VERSION = 'template-explanation-v1';
export const FUTURE_PROMPT_VERSION = 'grounded-explanation-prompt-v1';

const VI_MARKERS = /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]|\b(?:cảm biến|thiết bị|đo|hỗ trợ|nhiệt độ|hoạt động)\b/iu;
const clean = (value) => value.normalize('NFC').toLocaleLowerCase('en-US');

export function explanationLanguage(query, declaredLanguage) {
  if (declaredLanguage === 'en' || declaredLanguage === 'vi') return declaredLanguage;
  return VI_MARKERS.test(query) ? 'vi' : 'en';
}

export function matchedFeatures(technical) {
  if (!technical) return [];
  const features = [];
  for (const item of technical.identityEvidence ?? []) features.push(`identity:${item.field}:${item.value}`);
  for (const item of technical.protocolMatches ?? []) {
    if (item.result !== 'MATCH') continue;
    for (const evidence of item.evidence) if (evidence.relation === 'supported') features.push(`protocol:${evidence.canonicalProtocol}`);
  }
  for (const item of technical.temperatureMatches ?? []) {
    if (item.result !== 'MATCH') continue;
    const constraint = item.constraint;
    const value = constraint.kind === 'range'
      ? `${constraint.minCelsius}..${constraint.maxCelsius}${constraint.unit}`
      : constraint.kind === 'upper_bound'
        ? `up-to-${constraint.valueCelsius}${constraint.unit}`
        : `${constraint.valueCelsius}${constraint.unit}`;
    features.push(`${constraint.intent}-temperature:${value}`);
  }
  return [...new Set(features)];
}

function selectedSemanticEvidence(document, concepts, group, field) {
  const keys = new Set(concepts.filter((item) => item.group === group).map((item) => item.key));
  return (document?.[field] ?? []).filter((item) => keys.has(item.key));
}

function taxonomyEvidence(document, concepts) {
  if (!document?.taxonomy) return null;
  const keys = new Set(concepts.filter((item) => item.group.startsWith('taxonomy_')).map((item) => item.key));
  if (!keys.has(document.taxonomy.subcategory_key) && !keys.has(document.taxonomy.device_type_key)) return null;
  return document.taxonomy;
}

function contextualTaxonomy(query, document) {
  const tokens = new Set(clean(query).match(/[\p{L}\p{N}]+/gu)?.filter((token) => token.length >= 4) ?? []);
  const taxonomyText = clean([document?.taxonomy?.category, document?.taxonomy?.subcategory, document?.taxonomy?.device_type].filter(Boolean).join(' '));
  return [...tokens].some((token) => taxonomyText.includes(token));
}

function technicalConstraints(technical) {
  if (!technical) return [];
  return (technical.temperatureMatches ?? []).map((item) => ({
    type: `${item.constraint.intent}_temperature`,
    requested: item.constraint,
    status: item.result,
    evidence: item.evidence.map((evidence) => ({
      canonical_key: evidence.canonicalKey,
      candidate_range: evidence.candidateRange,
      status: evidence.result,
      raw_ref: evidence.rawRef,
    })),
  }));
}

function relevantSpecifications(constraints) {
  return constraints.flatMap((constraint) => constraint.evidence
    .filter((item) => item.status === 'MATCH')
    .map((item) => ({
      canonical_key: item.canonical_key,
      value: item.candidate_range,
      unit: item.candidate_range?.unit ?? null,
      evidence_reason: `Confirms ${constraint.type} constraint`,
      raw_ref: item.raw_ref,
    })));
}

export class GroundedEvidenceBuilder {
  constructor(vocabulary) {
    this.vocabulary = vocabulary;
  }

  build({ query, declaredLanguage, document, technical, retrievalContext = true }) {
    if (!document) throw new Error('A current product search document is required');
    const language = explanationLanguage(query, declaredLanguage);
    const normalized = normalizeQuery(query, this.vocabulary, [document.product_id, document.model, ...(document.aliases ?? [])]);
    const concepts = normalized.detected_concepts;
    const constraints = technicalConstraints(technical);
    const taxonomy = taxonomyEvidence(document, concepts);
    const measurements = selectedSemanticEvidence(document, concepts, 'measurement', 'measurements');
    const capabilities = selectedSemanticEvidence(document, concepts, 'capability', 'capabilities');
    const applications = selectedSemanticEvidence(document, concepts, 'application', 'applications');
    const protocols = (technical?.protocolMatches ?? []).map((item) => ({
      protocol: item.queryProtocol,
      status: item.result,
      evidence: item.evidence.map((evidence) => ({
        source: evidence.source,
        canonical_protocol: evidence.canonicalProtocol,
        relation: evidence.relation,
      })),
    }));
    const exactMatch = technical?.identityMatch === 'exact';
    const hasSpecificEvidence = exactMatch || taxonomy || measurements.length > 0 || capabilities.length > 0 || applications.length > 0 || protocols.length > 0 || constraints.length > 0;
    const pack = {
      evidence_version: EVIDENCE_VERSION,
      query: query.normalize('NFC').trim(),
      language,
      product: {
        product_id: document.product_id,
        model: document.model,
        product_name: language === 'vi' && document.name_vi ? document.name_vi : document.name_en,
      },
      identity: {
        exact_match: exactMatch,
        matched_value: technical?.identityEvidence?.[0]?.value ?? null,
      },
      taxonomy,
      measurements,
      matched_features: matchedFeatures(technical),
      protocols,
      technical_constraints: constraints,
      capabilities,
      applications,
      specifications: relevantSpecifications(constraints),
      semantic_context: retrievalContext && !hasSpecificEvidence && contextualTaxonomy(query, document) ? {
        status: 'CONTEXT_ONLY',
        category: document.taxonomy?.category ?? null,
        device_type: document.taxonomy?.device_type ?? null,
      } : null,
    };
    assertEvidencePack(pack);
    return pack;
  }
}

export function assertEvidencePack(pack) {
  if (pack.evidence_version !== EVIDENCE_VERSION) throw new Error('Unsupported evidence version');
  if (!pack.query || !pack.product?.product_id || !pack.product?.model) throw new Error('Incomplete evidence identity');
  if (!['en', 'vi'].includes(pack.language)) throw new Error('Unsupported explanation language');
  if (pack.protocols.some((item) => item.status === 'MATCH' && !item.evidence.some((evidence) => evidence.relation === 'supported'))) throw new Error('Protocol MATCH requires supporting evidence');
  if (pack.technical_constraints.some((item) => item.status === 'MATCH' && !item.evidence.some((evidence) => evidence.status === 'MATCH'))) throw new Error('Numeric MATCH requires supporting evidence');
  return pack;
}

export class ExplanationProvider {
  generate() {
    throw new Error('ExplanationProvider.generate must be implemented');
  }
}

function requestedTemperature(constraint) {
  const value = constraint.requested;
  if (value.kind === 'range') return `${value.minCelsius} to ${value.maxCelsius}${value.unit}`;
  return `${value.valueCelsius}${value.unit}`;
}

export class DeterministicTemplateExplanationProvider extends ExplanationProvider {
  generate({ evidence }) {
    assertEvidencePack(evidence);
    const vi = evidence.language === 'vi';
    const sentences = [];
    if (evidence.identity.exact_match) sentences.push(vi ? `Khớp chính xác model ${evidence.product.model}.` : `Exact model match: ${evidence.product.model}.`);
    for (const item of evidence.protocols.slice(0, 2)) {
      if (item.status === 'MATCH') sentences.push(vi ? `Có bằng chứng cấu trúc xác nhận hỗ trợ ${item.protocol}.` : `Structured evidence confirms support for ${item.protocol}.`);
      else if (item.status === 'UNKNOWN') sentences.push(vi ? `Bằng chứng cấu trúc hiện có chưa xác nhận hỗ trợ ${item.protocol}.` : `Available structured evidence does not confirm ${item.protocol} support.`);
      else sentences.push(vi ? `Bằng chứng cấu trúc cho biết sản phẩm không hỗ trợ ${item.protocol}.` : `Structured evidence indicates that the product does not support ${item.protocol}.`);
    }
    for (const item of evidence.technical_constraints.slice(0, 1)) {
      const requested = requestedTemperature(item);
      if (item.status === 'MATCH') {
        const range = item.evidence.find((candidate) => candidate.status === 'MATCH')?.candidate_range;
        sentences.push(vi ? `Dải nhiệt độ ${range.minCelsius} đến ${range.maxCelsius}${range.unit} bao phủ yêu cầu ${requested}.` : `Its ${range.minCelsius} to ${range.maxCelsius}${range.unit} temperature range covers the requested ${requested}.`);
      } else if (item.status === 'UNKNOWN') sentences.push(vi ? `Chưa có đủ bằng chứng cấu trúc để xác nhận yêu cầu nhiệt độ ${requested}.` : `Structured evidence is insufficient to confirm the ${requested} temperature requirement.`);
      else sentences.push(vi ? `Dải nhiệt độ được ghi nhận không đáp ứng yêu cầu ${requested}.` : `The documented temperature range does not meet the requested ${requested}.`);
    }
    if (sentences.length === 0 && evidence.taxonomy) sentences.push(vi ? `Loại thiết bị được xác nhận là ${evidence.taxonomy.device_type}.` : `Its confirmed device type is ${evidence.taxonomy.device_type}.`);
    if (sentences.length < 2 && evidence.measurements.length > 0) {
      const labels = evidence.measurements.slice(0, 2).map((item) => vi ? item.label_vi : item.label_en).join(', ');
      sentences.push(vi ? `Các phép đo liên quan được ghi nhận: ${labels}.` : `Relevant documented measurements: ${labels}.`);
    }
    if (sentences.length < 2 && evidence.capabilities.length > 0) {
      const labels = evidence.capabilities.slice(0, 2).map((item) => vi ? item.label_vi : item.label_en).join(', ');
      sentences.push(vi ? `Năng lực liên quan được ghi nhận: ${labels}.` : `Relevant documented capabilities: ${labels}.`);
    }
    if (sentences.length < 2 && evidence.applications.length > 0) {
      const labels = evidence.applications.slice(0, 2).map((item) => vi ? item.label_vi : item.label_en).join(', ');
      sentences.push(vi ? `Ứng dụng liên quan được ghi nhận: ${labels}.` : `Relevant documented applications: ${labels}.`);
    }
    if (sentences.length === 0 && evidence.semantic_context) sentences.push(vi ? `Sản phẩm có liên quan theo ngữ cảnh tìm kiếm trong nhóm ${evidence.semantic_context.device_type ?? evidence.semantic_context.category}.` : `The product is contextually related to the query as a ${evidence.semantic_context.device_type ?? evidence.semantic_context.category}.`);
    if (sentences.length === 0) sentences.push(vi ? `Không có bằng chứng cấu trúc cụ thể để giải thích mức độ phù hợp của ${evidence.product.model}.` : `No specific structured evidence confirms why ${evidence.product.model} matches this query.`);
    return { provider: 'deterministic-template', template_version: TEMPLATE_VERSION, language: evidence.language, explanation: sentences.slice(0, 3).join(' ') };
  }
}

export class LLMGroundedExplanationProvider extends ExplanationProvider {
  constructor(generateGroundedText) {
    super();
    this.generateGroundedText = generateGroundedText;
  }

  generate(input) {
    if (!this.generateGroundedText) throw new Error('No approved local generative model is configured');
    return this.generateGroundedText(input);
  }
}

function sentenceContaining(text, token) {
  return text.split(/(?<=[.!?])\s+/u).find((sentence) => clean(sentence).includes(clean(token))) ?? '';
}

export function validateExplanation(evidence, generated) {
  const explanation = generated?.explanation?.trim() ?? '';
  const violations = {
    unsupported_protocol_claims: 0,
    unsupported_model_claims: 0,
    numeric_contradictions: 0,
    unknown_as_match: 0,
    wrong_language: 0,
    empty_explanations: explanation ? 0 : 1,
    technical_term_changes: 0,
  };
  const protocolClaims = [...new Set(explanation.match(/SDI-12|RS-485|Modbus RTU|Modbus/giu) ?? [])];
  for (const claimed of protocolClaims) {
    const sentence = sentenceContaining(explanation, claimed);
    const positive = /\b(?:confirms? support|supports?)\b|\b(?:xác nhận hỗ trợ|có hỗ trợ)\b/iu.test(sentence)
      && !/\b(?:does not|not support)\b|\b(?:chưa|không)\b/iu.test(sentence);
    const grounded = evidence.protocols.some((item) => clean(item.protocol) === clean(claimed) && item.status === 'MATCH');
    if (positive && !grounded) violations.unsupported_protocol_claims += 1;
  }
  for (const protocol of evidence.protocols) {
    const sentence = sentenceContaining(explanation, protocol.protocol);
    const positive = /\b(?:confirms? support|supports?)\b|\b(?:xác nhận hỗ trợ|có hỗ trợ)\b/iu.test(sentence)
      && !/\b(?:does not|not support)\b|\b(?:chưa|không)\b/iu.test(sentence);
    if (positive && protocol.status === 'UNKNOWN') violations.unknown_as_match += 1;
    const flattened = (value) => clean(value).replace(/[^\p{L}\p{N}]/gu, '');
    if (!explanation.includes(protocol.protocol) && flattened(explanation).includes(flattened(protocol.protocol))) violations.technical_term_changes += 1;
  }
  if (/exact model match|khớp chính xác model/iu.test(explanation) && !evidence.identity.exact_match) violations.unsupported_model_claims += 1;
  for (const constraint of evidence.technical_constraints) {
    const positive = /\b(?:covers?|includes?|supports?)\b|\b(?:bao phủ|đáp ứng)\b/iu.test(explanation);
    if (positive && constraint.status !== 'MATCH') violations.numeric_contradictions += 1;
    if (positive && constraint.status === 'UNKNOWN') violations.unknown_as_match += 1;
  }
  if (explanation && evidence.language === 'vi' && !VI_MARKERS.test(explanation)) violations.wrong_language += 1;
  if (explanation && evidence.language === 'en' && /\b(?:bằng chứng|sản phẩm|yêu cầu|chính xác)\b/iu.test(explanation)) violations.wrong_language += 1;
  return { violations, pass: Object.values(violations).every((value) => value === 0) };
}
