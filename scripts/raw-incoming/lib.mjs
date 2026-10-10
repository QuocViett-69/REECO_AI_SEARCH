// Curated raw records are replaced wholesale on update, so refuse a staged
// product that would silently drop existing specs or section context.
const specKey = (spec) =>
  `${String(spec?.name_en ?? '').trim().toLocaleLowerCase('en-US')}|${String(spec?.value_raw ?? '').trim()}`;
const sectionKey = (spec) =>
  String(spec?.section ?? '').trim().toLocaleLowerCase('en-US');
export const findDroppedRawContent = (existingProduct, stagedProduct) => {
  const existingSpecs = existingProduct?.specifications ?? [];
  const stagedSpecs = stagedProduct?.specifications ?? [];
  const stagedSpecKeys = new Set(stagedSpecs.map(specKey));
  const stagedSections = new Set(stagedSpecs.map(sectionKey));
  const droppedSpecs = existingSpecs
    .filter((spec) => !stagedSpecKeys.has(specKey(spec)))
    .map(({ section, name_en, value_raw }) => ({ section, name_en, value_raw }));
  const droppedSections = [
    ...new Set(
      existingSpecs
        .filter((spec) => !stagedSections.has(sectionKey(spec)))
        .map((spec) => spec.section),
    ),
  ];
  return droppedSpecs.length > 0 || droppedSections.length > 0
    ? { dropped_specs: droppedSpecs, dropped_sections: droppedSections }
    : null;
};

// A column shift (CRS451) leaves Vietnamese in name_en, or the value repeated in name_vi.
const VIETNAMESE_LETTER = /[À-ÖØ-öø-ɏḀ-ỿ]/u;
export const findColumnShiftedSpecs = (product) =>
  (product?.specifications ?? [])
    .filter((spec) => {
      const nameVi = String(spec?.name_vi ?? '').trim();
      return (
        VIETNAMESE_LETTER.test(String(spec?.name_en ?? '')) ||
        (nameVi !== '' && nameVi === String(spec?.value_raw ?? '').trim())
      );
    })
    .map(({ section, name_en, name_vi, value_raw }) => ({ section, name_en, name_vi, value_raw }));
