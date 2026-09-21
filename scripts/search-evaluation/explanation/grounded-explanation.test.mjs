import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  DeterministicTemplateExplanationProvider,
  GroundedEvidenceBuilder,
  LLMGroundedExplanationProvider,
  explanationLanguage,
  validateExplanation,
} from './grounded-explanation.mjs';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const vocabulary = JSON.parse(await readFile(path.join(root, 'data/ontology/semantic-vocabulary.json'), 'utf8'));
const document = JSON.parse(await readFile(path.join(root, 'data/search-documents/CSI_CS655.json'), 'utf8'));
const builder = new GroundedEvidenceBuilder(vocabulary);
const provider = new DeterministicTemplateExplanationProvider();
const baseTechnical = {
  identityMatch: 'none', identityEvidence: [], protocolMatches: [], temperatureMatches: [], hardMismatch: false,
};
const build = (query, technical = baseTechnical, declaredLanguage = 'en') => builder.build({ query, declaredLanguage, document, technical });

test('builds exact identity evidence and a grounded fallback explanation', () => {
  const evidence = build('CS655', { ...baseTechnical, identityMatch: 'exact', identityEvidence: [{ source: 'products', field: 'model', value: 'CS655' }] });
  const output = provider.generate({ evidence });
  assert.equal(evidence.identity.exact_match, true);
  assert.match(output.explanation, /Exact model match: CS655/u);
  assert.equal(validateExplanation(evidence, output).pass, true);
});

test('requires structured protocol evidence and preserves Modbus specificity', () => {
  const match = build('sensor with SDI-12', { ...baseTechnical, protocolMatches: [{ queryProtocol: 'SDI-12', result: 'MATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'SDI-12', relation: 'supported' }] }] });
  assert.match(provider.generate({ evidence: match }).explanation, /SDI-12/u);
  const broad = build('Modbus device', { ...baseTechnical, protocolMatches: [{ queryProtocol: 'Modbus', result: 'MATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'Modbus RTU', relation: 'supported' }] }] });
  assert.equal(broad.protocols[0].protocol, 'Modbus');
  assert.equal(broad.protocols[0].evidence[0].canonical_protocol, 'Modbus RTU');
  assert.doesNotMatch(provider.generate({ evidence: broad }).explanation, /support for Modbus RTU/u);
  const unsafe = validateExplanation(broad, { explanation: 'Structured evidence confirms support for Modbus RTU.' });
  assert.equal(unsafe.violations.unsupported_protocol_claims, 1);
});

test('preserves numeric MATCH and UNKNOWN semantics', () => {
  const constraint = { kind: 'point', intent: 'operating', valueCelsius: -40, unit: '°C', confidence: 'high' };
  const match = build('operates at -40°C', { ...baseTechnical, temperatureMatches: [{ constraint, result: 'MATCH', evidence: [{ source: 'normalized_spec', canonicalKey: 'operating_temperature_range', candidateRange: { minCelsius: -50, maxCelsius: 70, unit: '°C' }, result: 'MATCH', rawRef: { file: 'x', source_rows: [] } }] }] });
  assert.match(provider.generate({ evidence: match }).explanation, /covers the requested -40°C/u);
  const unknown = build('operates at -40°C', { ...baseTechnical, temperatureMatches: [{ constraint, result: 'UNKNOWN', evidence: [] }] });
  const output = provider.generate({ evidence: unknown });
  assert.match(output.explanation, /insufficient to confirm/u);
  assert.equal(validateExplanation(unknown, output).violations.unknown_as_match, 0);
});

test('never turns MISMATCH into a positive explanation', () => {
  const constraint = { kind: 'point', intent: 'operating', valueCelsius: -200, unit: '°C', confidence: 'high' };
  const evidence = build('operates at -200°C', { ...baseTechnical, temperatureMatches: [{ constraint, result: 'MISMATCH', evidence: [{ source: 'normalized_spec', canonicalKey: 'operating_temperature_range', candidateRange: { minCelsius: -50, maxCelsius: 70, unit: '°C' }, result: 'MISMATCH', rawRef: { file: 'x', source_rows: [] } }] }], hardMismatch: true });
  const output = provider.generate({ evidence });
  assert.match(output.explanation, /does not meet/u);
  assert.equal(validateExplanation(evidence, output).pass, true);
});

test('selects English and Vietnamese deterministically while preserving tokens', () => {
  assert.equal(explanationLanguage('CSI_CS655', 'mixed'), 'en');
  assert.equal(explanationLanguage('cảm biến SDI-12', 'mixed'), 'vi');
  const evidence = build('cảm biến hỗ trợ SDI-12', { ...baseTechnical, protocolMatches: [{ queryProtocol: 'SDI-12', result: 'MATCH', evidence: [{ source: 'product_document', canonicalProtocol: 'SDI-12', relation: 'supported' }] }] }, 'vi');
  const output = provider.generate({ evidence });
  assert.match(output.explanation, /bằng chứng/u);
  assert.match(output.explanation, /SDI-12/u);
  assert.equal(validateExplanation(evidence, output).pass, true);
});

test('handles no query-specific evidence and rejects an unconfigured LLM provider', () => {
  const evidence = builder.build({ query: 'unknown concept', declaredLanguage: 'en', document, technical: baseTechnical, retrievalContext: false });
  assert.match(provider.generate({ evidence }).explanation, /No specific structured evidence/u);
  assert.throws(() => new LLMGroundedExplanationProvider().generate({ evidence }), /No approved local generative model/u);
});
