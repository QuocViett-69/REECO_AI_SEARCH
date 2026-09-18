export const TECHNICAL_QUERY_PARSER_VERSION = 'technical-query-v1';

export const SUPPORTED_TECHNICAL_PROTOCOLS = [
  'SDI-12',
  'RS-485',
  'Modbus',
  'Modbus RTU',
] as const;

export const OPERATING_TEMPERATURE_KEYS = [
  'operating_temperature_range',
  'operating_temperature_extended_duty_xd',
] as const;

export const MEASUREMENT_TEMPERATURE_KEYS = [
  'air_temperature_measurement_range',
  'air_temperature_range',
  'soil_temperature_range',
  'temperature_measurement_range',
  'temperature_measurement_operating_range',
] as const;

export const CELSIUS_UNIT = '°C';
