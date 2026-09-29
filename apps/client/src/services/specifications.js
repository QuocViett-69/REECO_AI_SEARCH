// Keep source conditions, tolerances and alternate units in every product view.
export function formatSpecValue(value) {
  if (!value) return '—';
  let text = value.value_raw;
  if (text == null || text === '') {
    const quantity = (number, unit) => `${number ?? ''} ${unit || ''}`.trim();
    if (value.type === 'range') {
      text = value.min && value.max
        ? `${quantity(value.min.value, value.min.unit)} – ${quantity(value.max.value, value.max.unit)}`
        : quantity(`${value.min_value ?? ''} – ${value.max_value ?? ''}`, value.unit);
    } else if (value.type === 'number' || value.type === 'quantity') {
      text = quantity(value.value, value.unit);
    } else if (value.type === 'boolean') {
      text = value.value ? 'Yes' : 'No';
    } else {
      text = value.values?.join(', ') ?? String(value.value ?? '—');
    }
    if (value.qualifier) text = `${value.qualifier} ${text}`;
    if (value.alternate) {
      const alternate = value.alternate;
      text += ` (${quantity(alternate.value ?? `${alternate.min_value} – ${alternate.max_value}`, alternate.unit)})`;
    }
    if (value.condition) text += ` (${value.condition})`;
    if (value.note) text += ` (${value.note})`;
  }
  return String(text).replace(/([≤≥])\s*(±)/gu, '$1 $2').replace(/(\d)\s*°\s*C\b/gu, '$1 °C');
}

export function groupSpecifications(specifications = []) {
  const groups = new Map();
  for (const spec of specifications || []) {
    const key = spec.canonical_key;
    if (!groups.has(key)) groups.set(key, { canonical_key: key, quantity_kind: spec.quantity_kind, values: [] });
    groups.get(key).values.push(formatSpecValue(spec.normalized_value));
  }
  return [...groups.values()];
}

export function buildSpecMap(specifications) {
  return Object.fromEntries(groupSpecifications(specifications).map((group) => [group.canonical_key, group.values.join('\n')]));
}
