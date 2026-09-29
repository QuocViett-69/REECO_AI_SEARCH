import type { SearchRequest } from '@reeco/shared';
export declare const hasTechnicalConstraint: (query: string) => boolean;
export declare const hasUnsupportedNegativeConstraint: (query: string) => boolean;
export declare function resolveConversationQuery(query: string, context?: SearchRequest['context']): {
    query: string;
    applied: boolean;
};
