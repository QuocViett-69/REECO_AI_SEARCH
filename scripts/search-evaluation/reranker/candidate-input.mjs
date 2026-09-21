export function supportsProtocol(document, protocol) {
  return document.supported_protocols.some((item) => protocol === 'Modbus' ? item === 'Modbus' || item.startsWith('Modbus ') : item === protocol);
}

export function compactCandidate(document, parsed = { protocols: [], temperatureConstraints: [] }) {
  const matchedFeatures = [];
  if (parsed.identity?.productId === document.product_id) matchedFeatures.push(`identity:${parsed.identity.matchedField}:${parsed.identity.model}`);
  for (const protocol of parsed.protocols ?? []) if (supportsProtocol(document, protocol)) matchedFeatures.push(`protocol:${protocol}`);
  return {
    product_id: document.product_id,
    model: document.model,
    product_name: document.name_en,
    product_name_vi: document.name_vi,
    taxonomy: document.taxonomy,
    measurements: document.measurements,
    capabilities: document.capabilities,
    applications: document.applications,
    protocols: document.supported_protocols,
    relevant_normalized_specifications: (parsed.temperatureConstraints ?? []).length > 0
      ? document.important_specifications.filter((item) => item.quantity_kind === 'temperature' && item.normalized_value.type === 'range')
      : [],
    matched_features: matchedFeatures,
  };
}
