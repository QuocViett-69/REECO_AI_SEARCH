import assert from 'node:assert/strict';
import test from 'node:test';
import { findColumnShiftedSpecs, findDroppedRawContent } from '../raw-incoming/lib.mjs';
import { createSearchDocumentPlan } from '../search-documents/lib.mjs';
import { canonicalSlug, createNormalizationPlan } from './lib.mjs';

const spec = (section, name_en, value_raw) => ({ section, name_en, value_raw });

test('promote refuses staged products that drop curated specs or sections', () => {
  const existing = {
    specifications: [
      spec('WIND ACCURACY', 'Accuracy', '±8 cm/s'),
      spec('General Specifications', 'Weight', '0.9 kg (1.95 lb)'),
    ],
  };
  assert.equal(findDroppedRawContent(existing, existing), null);
  const dropped = findDroppedRawContent(existing, {
    specifications: [spec('SPECIFICATIONS', 'Accuracy', '±8 cm/s')],
  });
  assert.deepEqual(dropped.dropped_sections, [
    'WIND ACCURACY',
    'General Specifications',
  ]);
  assert.deepEqual(
    dropped.dropped_specs.map((item) => item.name_en),
    ['Weight'],
  );
});

test('normalization: unit-aware kinds/keys, URL-free protocols, ranges with notes', async () => {
  const { documents } = await createNormalizationPlan();
  const specs = (id) =>
    documents.find((document) => document.product_id === id).specifications;

  const weight = specs('CSI_CPEC306_DW').find((item) =>
    /Granite Volt/u.test(item.name_raw),
  );
  assert.equal(weight.quantity_kind, 'mass');

  const hygro = specs('CSI_HYGROVUE5');
  const temperatureRange = hygro.find(
    (item) => item.canonical_key === 'temperature_measurement_range',
  );
  assert.equal(temperatureRange?.quantity_kind, 'temperature');
  assert.ok(
    hygro.some((item) => item.canonical_key === 'relative_humidity_measurement_range'),
  );

  for (const document of documents) {
    for (const item of document.specifications) {
      assert.ok(
        !/https?:\/\//iu.test(String(item.value_raw)) ||
          !(item.facets?.supported_protocols ?? []).includes('HTTPS'),
        `${document.product_id} ${item.name_raw}: URL classified as HTTPS`,
      );
    }
  }

  const operating = specs('CSI_COM320_AU').find(
    (item) => item.canonical_key === 'operating_temperature_range',
  );
  assert.deepEqual(
    [operating.type, operating.normalized.min_value, operating.normalized.max_value],
    ['range', -25, 50],
  );
  const execution = specs('CSI_CR6_NA_ST_CC').find(
    (item) => item.name_raw === 'Program Execution Period',
  );
  assert.equal(execution.normalized.max?.unit ?? execution.normalized.unit, 'day');
});

test('search documents never list a protocol as both supported and unsupported', async () => {
  const { documents } = await createSearchDocumentPlan();
  for (const document of documents) {
    const supported = new Set(document.supported_protocols);
    assert.deepEqual(
      document.unsupported_protocols.filter((name) => supported.has(name)),
      [],
      document.product_id,
    );
  }
});

test('canonicalSlug keeps Vietnamese đ as d', () => {
  assert.equal(canonicalSlug('Độ chính xác'), 'do_chinh_xac');
});

test('intake flags a column shift: Vietnamese in name_en or name_vi equal to the value', () => {
  const flagged = findColumnShiftedSpecs({
    specifications: [
      { name_en: 'Model cơ sở', name_vi: 'CRS451', value_raw: 'CRS451' },
      { name_en: 'Operating Temperature (ºC)', name_vi: 'Nhiệt độ', value_raw: '-40 to 70' },
      { name_en: 'Weight', name_vi: '0.5 kg', value_raw: '0.5 kg' },
    ],
  });
  assert.deepEqual(flagged.map((spec) => spec.name_en), ['Model cơ sở', 'Weight']);
});
