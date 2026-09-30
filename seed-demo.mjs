// Root wrapper for scripts/seed-demo.mjs
import { seedDemoOrders } from './scripts/seed-demo.mjs';
export * from './scripts/seed-demo.mjs';

const isDirectExecution =
  process.argv[1] && process.argv[1].endsWith('seed-demo.mjs');

if (isDirectExecution) {
  seedDemoOrders().catch((err) => {
    console.error('Lỗi thực thi seed demo:', err);
    process.exitCode = 1;
  });
}
