/**
 * One-time migration script - hashes all plain-text passwords in the database.
 *
 * Run once from the backend/ folder:
 *   node src/scripts/migratePasswords.js
 *
 * Safe to run multiple times - bcrypt hashes are detected by the "$2a$" / "$2b$"
 * prefix and skipped, so already-migrated users are never double-hashed.
 */

import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;
const DB_NAME = 'familylog';
const COLLECTION_NAME = 'datastore';
const DOCUMENT_NAME = 'appdata';

/**
 * Returns true if the string is already a bcrypt hash.
 * bcrypt hashes always start with $2a$ or $2b$.
 * @param {string} password
 * @returns {boolean}
 */
function isAlreadyHashed(password) {
  return typeof password === 'string' && (password.startsWith('$2a$') || password.startsWith('$2b$'));
}

async function migrate() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured');
  }

  const client = new MongoClient(mongoUri);
  let migratedCount = 0;
  let skippedCount = 0;

  try {
    await client.connect();

    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const result = await collection.findOne({ name: DOCUMENT_NAME });

    if (!result || !result.data) {
      console.log('No appdata document found. Nothing to migrate.');
      return;
    }

    const data = result.data;
    if (!Array.isArray(data.users)) {
      throw new Error('appdata document does not contain a valid users array');
    }

    for (const user of data.users) {
      if (!user || typeof user.password !== 'string') {
        console.log(`skipped: ${user?.username ?? user?.id ?? 'unknown user'}`);
        skippedCount += 1;
        continue;
      }

      if (isAlreadyHashed(user.password)) {
        console.log(`skipped: ${user.username}`);
        skippedCount += 1;
        continue;
      }

      user.password = await bcrypt.hash(user.password, SALT_ROUNDS);

      if (Array.isArray(user.passwordHistory)) {
        const migratedHistory = [];
        for (const historyEntry of user.passwordHistory) {
          if (typeof historyEntry === 'string' && historyEntry.length > 0) {
            migratedHistory.push(
              isAlreadyHashed(historyEntry)
                ? historyEntry
                : await bcrypt.hash(historyEntry, SALT_ROUNDS)
            );
          }
        }
        user.passwordHistory = migratedHistory;
      }

      console.log(`migrated: ${user.username}`);
      migratedCount += 1;
    }

    await collection.updateOne(
      { name: DOCUMENT_NAME },
      { $set: { data } }
    );

    console.log(`Migration complete. ${migratedCount} migrated, ${skippedCount} skipped.`);
  } finally {
    await client.close();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});