import { Injectable } from '@nestjs/common';
import type { ProductSearchDocument, SearchResponse } from '@reeco/shared';
import type { TechnicalMatchResult } from './technical-match.service';

type Explanation = NonNullable<SearchResponse['results'][number]['explanation']>;
type Evidence = Explanation['evidence'][number];

const isVietnamese = (query: string): boolean =>
  /[ăâđêôơư]|[\u1ea0-\u1ef9]/iu.test(query);

@Injectable()
export class ExplanationService {
  explain(
    query: string,
    document: ProductSearchDocument,
    match?: TechnicalMatchResult,
  ): Explanation {
    const vi = isVietnamese(query);
    const sentences: string[] = [];
    const evidence: Evidence[] = [];
    const add = (text: string, source?: Evidence): void => {
      if (sentences.length >= 3) return;
      sentences.push(text);
      if (source) evidence.push(source);
    };

    if (match?.identityMatch === 'exact') {
      add(
        vi ? `Khớp chính xác model ${document.model}.` : `Exact model match: ${document.model}.`,
        { source: 'products', field: 'model', value: document.model },
      );
    }

    for (const protocol of match?.protocolMatches ?? []) {
      if (protocol.result === 'MATCH') {
        const support = protocol.evidence.find((item) => item.relation === 'supported');
        if (!support) continue;
        add(
          vi ? `Dữ liệu sản phẩm xác nhận hỗ trợ ${protocol.queryProtocol}.` : `Product data confirms support for ${protocol.queryProtocol}.`,
          { source: 'product_document', field: 'supported_protocols', value: support.canonicalProtocol },
        );
      } else if (protocol.result === 'UNKNOWN') {
        add(vi ? `Chưa có dữ liệu xác nhận hỗ trợ ${protocol.queryProtocol}.` : `Available data does not confirm support for ${protocol.queryProtocol}.`);
      } else {
        const unsupported = protocol.evidence.find((item) => item.relation === 'unsupported');
        if (!unsupported) continue;
        add(
          vi ? `Dữ liệu sản phẩm ghi rõ không hỗ trợ ${protocol.queryProtocol}.` : `Product data lists ${protocol.queryProtocol} as unsupported.`,
          { source: 'product_document', field: 'unsupported_protocols', value: unsupported.canonicalProtocol },
        );
      }
    }

    for (const temperature of match?.temperatureMatches ?? []) {
      const request = temperature.constraint.kind === 'range'
        ? `${temperature.constraint.minCelsius}–${temperature.constraint.maxCelsius}°C`
        : `${temperature.constraint.valueCelsius}°C`;
      if (temperature.result === 'MATCH') {
        const support = temperature.evidence.find((item) => item.result === 'MATCH' && item.candidateRange);
        if (!support?.candidateRange) continue;
        const range = `${support.candidateRange.minCelsius}–${support.candidateRange.maxCelsius}°C`;
        add(
          vi ? `Dải nhiệt độ ${range} đáp ứng yêu cầu ${request}.` : `The documented ${range} temperature range covers ${request}.`,
          { source: 'normalized_spec', field: support.canonicalKey, value: range },
        );
      } else if (temperature.result === 'UNKNOWN') {
        add(vi ? `Chưa đủ dữ liệu để xác nhận yêu cầu nhiệt độ ${request}.` : `Available data cannot confirm the ${request} temperature requirement.`);
      }
    }

    if (sentences.length === 0) {
      const normalizedQuery = query.normalize('NFC').toLocaleLowerCase();
      const groups = [
        ['measurements', document.measurements],
        ['capabilities', document.capabilities],
        ['applications', document.applications],
      ] as const;
      for (const [field, items] of groups) {
        const item = items.find((entry) =>
          [entry.label_en, entry.label_vi].some((label) => label.length >= 4 && normalizedQuery.includes(label.toLocaleLowerCase())),
        );
        if (!item) continue;
        const label = vi ? item.label_vi : item.label_en;
        add(
          vi ? `Dữ liệu sản phẩm ghi nhận ${label}.` : `Product data lists ${label}.`,
          { source: 'product_document', field, value: label },
        );
        break;
      }
    }

    if (sentences.length === 0) {
      const type = document.taxonomy.device_type;
      const relevantType = query
        .normalize('NFC')
        .toLocaleLowerCase()
        .match(/[\p{L}]{4,}/gu)
        ?.filter((word) => !['sensor', 'device', 'product'].includes(word))
        .some((word) => type.toLocaleLowerCase().includes(word));
      add(
        relevantType
          ? (vi ? `Danh mục sản phẩm ghi nhận đây là ${type}.` : `The catalog classifies this as ${type}.`)
          : (vi ? `Danh mục ghi nhận đây là ${type}; chưa có bằng chứng cụ thể hơn cho truy vấn.` : `The catalog classifies this as ${type}; no more specific evidence confirms the query.`),
        { source: 'product_document', field: 'taxonomy.device_type', value: type },
      );
    }

    return { text: sentences.join(' '), language: vi ? 'vi' : 'en', evidence };
  }
}
