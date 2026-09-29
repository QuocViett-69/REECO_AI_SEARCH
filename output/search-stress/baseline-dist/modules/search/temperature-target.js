"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTemperatureTarget = parseTemperatureTarget;
exports.temperatureTargetEvidence = temperatureTargetEvidence;
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/gu, '').replace(/đ/giu, 'd').toLowerCase();
const targets = [
    { key: 'water_temperature', en: 'water temperature', vi: 'nhiệt độ nước', pattern: /\bwater(?: and soil)?[- ]temperature\b|\btemperature (?:of|in) (?:the )?water\b|\bnhiet do (?:(?:cua|trong) )?nuoc\b/u },
    { key: 'soil_temperature', en: 'soil temperature', vi: 'nhiệt độ đất', pattern: /\b(?:soil|ground)(?: and water)?[- ]temperature\b|\btemperature (?:of|in) (?:the )?soil\b|\bnhiet do (?:(?:cua|trong) )?dat\b/u },
    { key: 'air_temperature', en: 'air temperature', vi: 'nhiệt độ không khí', pattern: /\b(?:air|ambient)[- ]temperature\b|\btemperature (?:of|in) (?:the )?air\b|\bnhiet do (?:(?:cua|trong) )?khong khi\b/u },
];
function parseTemperatureTarget(query) {
    const found = targets.filter((target) => target.pattern.test(normalize(query)));
    return found.length === 1 ? found[0] : undefined;
}
function temperatureTargetEvidence(document, target) {
    if (document.measurements.some((item) => item.key === target.key))
        return 'measurements';
    if (document.capabilities.some((item) => item.key === `measure_${target.key}`))
        return 'capabilities';
    if (target.pattern.test(normalize(document.taxonomy.device_type)))
        return 'taxonomy.device_type';
    return undefined;
}
//# sourceMappingURL=temperature-target.js.map