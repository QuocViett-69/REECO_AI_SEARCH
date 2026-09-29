import { type PipeTransform } from '@nestjs/common';
import { z, type ZodTypeAny } from 'zod';
export declare class ZodValidationPipe<TSchema extends ZodTypeAny> implements PipeTransform<unknown, z.infer<TSchema>> {
    private readonly schema;
    constructor(schema: TSchema);
    transform(value: unknown): z.infer<TSchema>;
}
