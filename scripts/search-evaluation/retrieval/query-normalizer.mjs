const DATA_SUPPORTED_ALIASES = {
  volumetric_water_content: [
    'soil moisture',
    'soil water content',
    'soil moisture sensor',
    'độ ẩm đất',
    'cảm biến độ ẩm đất',
    'hàm lượng nước trong đất',
  ],
  relative_humidity: ['humidity', 'air humidity', 'độ ẩm không khí'],
  precipitation: ['rain', 'rain sensor'],
};

const RISKY_ALIASES = new Set([
  'rh',
  'mor',
  'stage',
  'sensor',
  'cảm biến',
  'device',
  'thiết bị',
]);
const vocabularyCache = new WeakMap();

const normalized = (value) =>
  value
    .normalize('NFC')
    .toLocaleLowerCase('en-US')
    .replace(/[‐‑–—]/gu, '-')
    .replace(/\s+/gu, ' ')
    .trim();

const identityKey = (value) =>
  value
    .normalize('NFC')
    .trim()
    .toLocaleUpperCase('en-US')
    .replace(/\s+/gu, '')
    .replace(/[-_]/gu, '');

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&').replace(/\s+/gu, '\\s+');

function entries(vocabulary) {
  return [
    ...vocabulary.taxonomy.subcategories.map((item) => ({ ...item, group: 'taxonomy_subcategory' })),
    ...vocabulary.taxonomy.device_types.map((item) => ({ ...item, group: 'taxonomy_device_type' })),
    ...vocabulary.measurements.map((item) => ({ ...item, group: 'measurement' })),
    ...vocabulary.applications.map((item) => ({ ...item, group: 'application' })),
    ...vocabulary.capabilities.map((item) => ({ ...item, group: 'capability' })),
  ];
}

export function buildQueryVocabulary(vocabulary) {
  const cached = vocabularyCache.get(vocabulary);
  if (cached) return cached;
  const concepts = entries(vocabulary).map((item) => ({
    concept: `${item.group}:${item.key}`,
    key: item.key,
    group: item.group,
    canonical: item.label_en,
    aliases: [...new Set([
      item.label_en,
      item.label_vi,
      ...(item.aliases ?? []),
      ...(DATA_SUPPORTED_ALIASES[item.key] ?? []),
    ].filter(Boolean))],
    data_supported_aliases: DATA_SUPPORTED_ALIASES[item.key] ?? [],
  }));
  const aliasOwners = new Map();
  for (const concept of concepts) {
    for (const alias of concept.aliases) {
      const key = normalized(alias);
      const owners = aliasOwners.get(key) ?? [];
      owners.push(concept);
      aliasOwners.set(key, owners);
    }
  }
  const built = { concepts, aliasOwners };
  vocabularyCache.set(vocabulary, built);
  return built;
}

function occurrence(query, alias) {
  const regex = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegex(alias)}(?![\\p{L}\\p{N}])`,
    'iu',
  );
  const match = regex.exec(query);
  return match ? { index: match.index, value: match[0], regex } : null;
}

export function normalizeQuery(query, vocabulary, identityValues = []) {
  const originalQuery = query.normalize('NFC').trim();
  if (!originalQuery) {
    return {
      original_query: originalQuery,
      detected_concepts: [],
      canonical_terms: [],
      aliases: [],
      alternatives: [],
      expanded_keyword_query: originalQuery,
      canonical_semantic_query: originalQuery,
      no_op_reason: 'empty',
    };
  }
  const identities = new Set(identityValues.map(identityKey));
  if (identities.has(identityKey(originalQuery))) {
    return {
      original_query: originalQuery,
      detected_concepts: [],
      canonical_terms: [],
      aliases: [],
      alternatives: [originalQuery],
      expanded_keyword_query: originalQuery,
      canonical_semantic_query: originalQuery,
      no_op_reason: 'exact_identity',
    };
  }

  const { aliasOwners } = buildQueryVocabulary(vocabulary);
  const matches = [];
  const ambiguousAliases = [];
  for (const [alias, owners] of aliasOwners) {
    const found = occurrence(originalQuery, alias);
    if (!found) continue;
    if (owners.length !== 1 || RISKY_ALIASES.has(alias)) {
      ambiguousAliases.push(alias);
      continue;
    }
    matches.push({ alias, concept: owners[0], ...found });
  }
  matches.sort((left, right) => right.value.length - left.value.length || left.index - right.index);
  const selected = [];
  for (const match of matches) {
    const end = match.index + match.value.length;
    if (selected.some((item) => match.index < item.end && end > item.index)) continue;
    selected.push({ ...match, end });
  }
  selected.sort((left, right) => left.index - right.index);

  const alternatives = [originalQuery];
  for (const match of selected) {
    for (const alias of match.concept.aliases) {
      if (normalized(alias) === normalized(match.value) || RISKY_ALIASES.has(normalized(alias))) continue;
      alternatives.push(originalQuery.replace(match.regex, alias));
    }
  }
  const uniqueAlternatives = [...new Set(alternatives)].slice(0, 16);
  let canonicalSemanticQuery = originalQuery;
  for (const match of [...selected].reverse()) {
    canonicalSemanticQuery = `${canonicalSemanticQuery.slice(0, match.index)}${match.concept.canonical}${canonicalSemanticQuery.slice(match.end)}`;
  }

  return {
    original_query: originalQuery,
    detected_concepts: selected.map((match) => ({
      concept: match.concept.concept,
      key: match.concept.key,
      group: match.concept.group,
      matched_alias: match.value,
      canonical: match.concept.canonical,
    })),
    canonical_terms: [...new Set(selected.map((match) => match.concept.canonical))],
    aliases: [...new Set(selected.flatMap((match) => match.concept.aliases))],
    ambiguous_aliases: [...new Set(ambiguousAliases)],
    alternatives: uniqueAlternatives,
    expanded_keyword_query: uniqueAlternatives.join(' OR '),
    canonical_semantic_query: canonicalSemanticQuery,
    no_op_reason: selected.length === 0 ? 'no_supported_concept' : null,
  };
}
