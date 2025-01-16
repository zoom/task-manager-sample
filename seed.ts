/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { createSeedClient } from "@snaplet/seed";
import {copycat} from "@snaplet/copycat";

// Define a method to generate a value
const generateValue = (seed) => {
  return copycat.int(seed, { max:  250});
};
// Create a store to track unique values
const store = new Set();

const main = async () => {
  const seed = await createSeedClient({ dryRun: true });

  // Truncate all tables in the database
  await seed.$resetDatabase();

  await seed.users(x => x(5, ({
    TaskLists: x => x(5),
    Tasks: x => x(5)
  })))

  console.log("Database seeded successfully!");

  process.exit();
};

main();