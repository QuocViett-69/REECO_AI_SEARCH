import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

const paths = {
  master: path.join(projectRoot, 'data', 'master', 'product-master.json'),
  source: path.join(
    projectRoot,
    'data',
    'master',
    'product-master-source.json',
  ),
  cs451: path.join(projectRoot, 'data', 'raw', 'CS451.json'),
  model43347: path.join(projectRoot, 'data', 'raw', '43347.json'),
};

const readJson = async (filePath) =>
  JSON.parse(await readFile(filePath, 'utf8'));

const writeJson = async (filePath, value) => {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  try {
    if ((await readFile(filePath, 'utf8')) === content) return false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(filePath, content, 'utf8');
  return true;
};

const droppedProductIds = new Set(['CSI_5103', 'CSI_CPEC310']);

const updateCanonicalProducts = (products) =>
  products
    .filter((product) => !droppedProductIds.has(product.product_id))
    .map((product) => {
      if (product.product_id === 'CSI_CR1000XE_ST_CC') {
        return {
          ...product,
          product_id: 'CSI_CR1000XE_XT_CC',
          model: 'CR1000Xe-XT-CC',
          product_name_en:
            'CR1000Xe Measurement and Control Datalogger (XT-CC)',
          verified: product.verified === undefined ? undefined : 'Yes',
        };
      }
      if (product.product_id === 'CSI_43347') {
        return {
          ...product,
          verified: product.verified === undefined ? undefined : 'Yes',
        };
      }
      if (product.product_id === 'CSI_CS451') {
        return {
          ...product,
          verified: product.verified === undefined ? undefined : 'Yes',
        };
      }
      return product;
    });

const specificationIdentity = (specification) =>
  JSON.stringify([
    specification.section ?? null,
    specification.name_en ?? null,
    specification.value_raw ?? null,
  ]);

const buildCs451Family = (document, canonicalProduct) => {
  const variantIds = ['CSI_CS451_HA', 'CSI_CS451_WN', 'CSI_CS451_NN'];
  const existingRepresentative = document.products.find(
    (product) => product.product_id === canonicalProduct.product_id,
  );
  if (
    existingRepresentative &&
    variantIds.every((productId) =>
      existingRepresentative.variants?.some(
        (variant) => variant.product_id === productId,
      ),
    )
  ) {
    return {
      ...document,
      products: [
        {
          ...existingRepresentative,
          model: canonicalProduct.model,
          product_name_en: canonicalProduct.product_name_en,
          taxonomy: {
            category: canonicalProduct.category,
            subcategory: canonicalProduct.subcategory,
            device_type: canonicalProduct.device_type,
          },
        },
      ],
    };
  }
  const sourceVariants = variantIds.map((productId) => {
    const product = document.products.find(
      (candidate) => candidate.product_id === productId,
    );
    if (!product) throw new Error(`Missing CS451 source variant: ${productId}`);
    return product;
  });

  const commonIdentities = new Set(
    sourceVariants[0].specifications
      .map(specificationIdentity)
      .filter((identity) =>
        sourceVariants
          .slice(1)
          .every((variant) =>
            variant.specifications.some(
              (specification) => specificationIdentity(specification) === identity,
            ),
          ),
      ),
  );
  const commonSpecifications = sourceVariants[0].specifications.filter(
    (specification) => commonIdentities.has(specificationIdentity(specification)),
  );
  const variants = sourceVariants.map((variant) => ({
    product_id: variant.product_id,
    model: variant.model,
    product_name_en: variant.product_name_en,
    is_representative: false,
    distinguishing_specifications: variant.specifications.filter(
      (specification) =>
        !commonIdentities.has(specificationIdentity(specification)),
    ),
    documents: variant.documents ?? {},
    media: variant.media ?? { product_images: [] },
    source: {
      file: document.source?.file ?? 'CS451.json',
      product_index: document.products.indexOf(variant),
    },
  }));
  const representativeSource = sourceVariants[0];

  return {
    schema_version: '1.2',
    source: {
      type: 'user_confirmed_product_family',
      original_source: document.source ?? null,
      resolution:
        'CSI_CS451 is the canonical representative; HA, WN, and NN are preserved as variants.',
    },
    products: [
      {
        ...representativeSource,
        product_id: canonicalProduct.product_id,
        model: canonicalProduct.model,
        product_name_en: canonicalProduct.product_name_en,
        identity_source: {
          model: 'user_confirmed_family',
          product_name_en: 'canonical_master',
        },
        taxonomy: {
          category: canonicalProduct.category,
          subcategory: canonicalProduct.subcategory,
          device_type: canonicalProduct.device_type,
        },
        specifications: commonSpecifications,
        validation: {
          status: 'validated',
          warnings: [],
        },
        variant_group: {
          representative_product_id: canonicalProduct.product_id,
          variant_count: variants.length,
          source_files: [document.source?.file ?? 'CS451.json'],
        },
        variants,
      },
    ],
  };
};

const resolve43347 = (document, canonicalProduct) => {
  const product = document.products?.[0];
  if (!product) throw new Error('Missing 43347 raw product');
  const specifications = (product.specifications ?? []).map((specification) =>
    specification.name_en === 'Model Number'
      ? { ...specification, value_raw: canonicalProduct.model }
      : specification,
  );
  return {
    ...document,
    products: [
      {
        ...product,
        product_id: canonicalProduct.product_id,
        model: canonicalProduct.model,
        product_name_en: canonicalProduct.product_name_en,
        identity_source: {
          model: 'user_confirmed',
          product_name_en: 'canonical_master',
        },
        taxonomy: {
          category: canonicalProduct.category,
          subcategory: canonicalProduct.subcategory,
          device_type: canonicalProduct.device_type,
        },
        specifications,
        validation: {
          status: 'validated',
          warnings: [
            'Canonical model 43347 was confirmed by the user; worksheet value 41342 is treated as a source typo.',
            'No explicit specification section labels were found in the worksheet; section remains null.',
          ],
        },
      },
    ],
  };
};

const [master, source, cs451Document, model43347Document] = await Promise.all([
  readJson(paths.master),
  readJson(paths.source),
  readJson(paths.cs451),
  readJson(paths.model43347),
]);

const updatedMaster = updateCanonicalProducts(master);
const updatedSource = updateCanonicalProducts(source);
const cs451Canonical = updatedMaster.find(
  (product) => product.product_id === 'CSI_CS451',
);
const model43347Canonical = updatedMaster.find(
  (product) => product.product_id === 'CSI_43347',
);
if (!cs451Canonical || !model43347Canonical) {
  throw new Error('Canonical CS451 or 43347 product is missing');
}

const changes = {
  master: await writeJson(paths.master, updatedMaster),
  source: await writeJson(paths.source, updatedSource),
  cs451: await writeJson(
    paths.cs451,
    buildCs451Family(cs451Document, cs451Canonical),
  ),
  model43347: await writeJson(
    paths.model43347,
    resolve43347(model43347Document, model43347Canonical),
  ),
};

console.log(
  JSON.stringify(
    {
      changes,
      dropped_product_ids: [...droppedProductIds],
      renamed_product: {
        from: 'CSI_CR1000XE_ST_CC',
        to: 'CSI_CR1000XE_XT_CC',
      },
      resolved_product_ids: ['CSI_CS451', 'CSI_43347'],
    },
    null,
    2,
  ),
);
