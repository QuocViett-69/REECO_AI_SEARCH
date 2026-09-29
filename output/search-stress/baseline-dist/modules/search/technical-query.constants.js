"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CELSIUS_UNIT = exports.MEASUREMENT_TEMPERATURE_KEYS = exports.OPERATING_TEMPERATURE_KEYS = exports.SUPPORTED_TECHNICAL_PROTOCOLS = exports.TECHNICAL_QUERY_PARSER_VERSION = void 0;
exports.TECHNICAL_QUERY_PARSER_VERSION = 'technical-query-v1';
exports.SUPPORTED_TECHNICAL_PROTOCOLS = [
    'SDI-12',
    'RS-485',
    'Modbus',
    'Modbus RTU',
    'Wi-Fi',
];
exports.OPERATING_TEMPERATURE_KEYS = [
    'operating_temperature_range',
    'operating_temperature_extended_duty_xd',
];
exports.MEASUREMENT_TEMPERATURE_KEYS = [
    'air_temperature_measurement_range',
    'air_temperature_range',
    'soil_temperature_range',
    'temperature_measurement_range',
    'temperature_measurement_operating_range',
];
exports.CELSIUS_UNIT = '°C';
