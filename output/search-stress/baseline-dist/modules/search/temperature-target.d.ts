import type { ProductSearchDocument } from '@reeco/shared';
declare const targets: readonly [{
    readonly key: "water_temperature";
    readonly en: "water temperature";
    readonly vi: "nhiệt độ nước";
    readonly pattern: RegExp;
}, {
    readonly key: "soil_temperature";
    readonly en: "soil temperature";
    readonly vi: "nhiệt độ đất";
    readonly pattern: RegExp;
}, {
    readonly key: "air_temperature";
    readonly en: "air temperature";
    readonly vi: "nhiệt độ không khí";
    readonly pattern: RegExp;
}];
export type TemperatureTarget = (typeof targets)[number];
export declare function parseTemperatureTarget(query: string): TemperatureTarget | undefined;
export declare function temperatureTargetEvidence(document: ProductSearchDocument, target: TemperatureTarget): "measurements" | "capabilities" | "taxonomy.device_type" | undefined;
export {};
