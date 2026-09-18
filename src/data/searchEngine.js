export function extractRequirements(query) {
  const q = query.toLowerCase();
  const reqs = [];
  if (q.includes('soil moisture') || q.includes('water content')) reqs.push('Soil moisture measurement');
  if (q.includes('sdi-12')) reqs.push('SDI-12 communication');
  if (q.includes('temperature')) reqs.push('Temperature measurement');
  if (q.includes('datalogger') || q.includes('logger')) reqs.push('Data acquisition');
  if (q.includes('cellular') || q.includes('remote')) reqs.push('Remote monitoring');
  if (q.includes('water level')) reqs.push('Water level measurement');
  if (q.includes('turbidity')) reqs.push('Turbidity measurement');
  if (q.includes('environmental')) reqs.push('Environmental monitoring');
  if (q.includes('sensor')) reqs.push('Sensor device');
  if (reqs.length === 0) reqs.push('General product search');
  return reqs;
}

export function scoreProduct(product, requirements) {
  let score = 50;
  const text = (
    product.model +
    ' ' +
    product.name +
    ' ' +
    product.category +
    ' ' +
    product.subcategory +
    ' ' +
    product.deviceType +
    ' ' +
    product.protocol
  ).toLowerCase();

  requirements.forEach((req) => {
    const r = req.toLowerCase();
    if (text.includes(r.split(' ')[0])) score += 15;
    if (text.includes(r)) score += 20;
  });

  return Math.min(98, Math.max(60, score));
}

export function generateExplanation(product, requirements) {
  const reqs = (requirements || []).map((r) => r.toLowerCase());
  const deviceType = (product.deviceType || product.device_type || 'device').toLowerCase();
  const subcategory = (product.subcategory || product.category || 'monitoring').toLowerCase();
  const protocol = product.protocol || 'standard protocols';

  let explanation = `${product.model} matches your request because it is a ${deviceType} designed for ${subcategory} applications`;

  if (reqs.some((r) => r.includes('sdi-12'))) {
    explanation += ` and supports ${protocol} communication`;
  }
  if (reqs.some((r) => r.includes('soil moisture') || r.includes('water content'))) {
    explanation += `, specifically measuring soil water content`;
  }
  if (reqs.some((r) => r.includes('temperature'))) {
    explanation += ` along with temperature monitoring`;
  }

  explanation += ', making it well-suited for your described requirements.';
  return explanation;
}
