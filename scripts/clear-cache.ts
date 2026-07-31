import "dotenv/config";
import { cache } from "../apps/dashboard/src/lib/cache";

async function main() {
  console.log("Clearing application caches...");
  try {
    await cache.invalidate("app:*");
    await cache.invalidate("products:storefront:*");
    console.log("Cache successfully cleared!");
  } catch (error) {
    console.error("Failed to clear cache:", error);
  }
}

main().then(() => process.exit(0));
