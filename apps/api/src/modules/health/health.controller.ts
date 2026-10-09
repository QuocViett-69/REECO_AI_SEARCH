import { Controller, Get } from '@nestjs/common';
import { configuration } from '../../config/configuration';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    const config = configuration();
    return { status: 'ok', check: 'liveness', embedding: {
      model: config.embedding.model, dimensions: config.embedding.dimensions,
      version: config.embedding.version, query_timeout_ms: config.search.embeddingTimeoutMs,
    } };
  }
}
