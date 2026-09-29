import type { ProductSearchDocument, ProductSpecification, SearchResponse } from '@reeco/shared';
type Evidence = NonNullable<SearchResponse['results'][number]['explanation']>['evidence'][number];
type Requirement = {
    key: string;
    en: string;
    vi: string;
    pattern: RegExp;
};
export declare function parseSearchIntent(query: string): {
    measurements: Requirement[];
    target: {
        readonly key: "water_temperature";
        readonly en: "water temperature";
        readonly vi: "nhiệt độ nước";
        readonly pattern: RegExp;
    } | {
        readonly key: "soil_temperature";
        readonly en: "soil temperature";
        readonly vi: "nhiệt độ đất";
        readonly pattern: RegExp;
    } | {
        readonly key: "air_temperature";
        readonly en: "air temperature";
        readonly vi: "nhiệt độ không khí";
        readonly pattern: RegExp;
    } | undefined;
    roles: Requirement[];
    outdoor: boolean;
    constrained: boolean;
};
export type SearchIntent = ReturnType<typeof parseSearchIntent>;
export declare function matchSearchIntent(intent: SearchIntent, document: ProductSearchDocument, specifications?: ProductSpecification[]): Evidence[] | null;
export {};
