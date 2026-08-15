import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import kvTagCache from '@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache';

// The ISR cache lives in R2 so a regenerated page is shared across all
// Worker isolates and regions, instead of each one rebuilding its own copy.
//
// Without an explicit tagCache, OpenNext falls back to a no-op "dummy" one
// — every revalidatePath()/revalidateTag() call in the admin server actions
// (save settings, add a menu item, add a branch, ...) would silently do
// nothing, and the public page would only ever pick up the change once the
// unrelated 120s time-based revalidate window happened to expire. The KV
// tag cache is what makes an admin's edit actually show up on the site
// right after saving instead of "maybe, eventually".
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: kvTagCache,
});
