import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';

// The ISR cache lives in R2 so a regenerated page is shared across all
// Worker isolates and regions, instead of each one rebuilding its own copy.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
