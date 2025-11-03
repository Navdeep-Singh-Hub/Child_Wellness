import 'dotenv/config';
import mongoose from 'mongoose';

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/child_wellness';
  console.log('Connecting to MongoDB:', mongoUri);
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db;
  const users = db.collection('users');

  // 1) Drop legacy clerkId index if present
  const indexes = await users.indexes();
  const hasClerkIdx = indexes.find(i => i.name === 'clerkId_1');
  if (hasClerkIdx) {
    console.log('Dropping legacy index clerkId_1...');
    try {
      await users.dropIndex('clerkId_1');
      console.log('Dropped clerkId_1 index');
    } catch (e) {
      console.log('Failed to drop clerkId_1 (may already be gone):', e.message);
    }
  } else {
    console.log('No clerkId_1 index found');
  }

  // 2) Unset legacy clerkId field from all docs
  console.log('Unsetting clerkId field from all documents...');
  const unsetRes = await users.updateMany({}, { $unset: { clerkId: '' } });
  console.log('Documents modified (unset clerkId):', unsetRes.modifiedCount);

  // 3) Ensure unique index on auth0Id
  console.log('Ensuring unique index on auth0Id...');
  try {
    await users.createIndex({ auth0Id: 1 }, { unique: true });
    console.log('auth0Id_1 unique index ensured');
  } catch (e) {
    console.log('Failed to create auth0Id unique index:', e.message);
  }

  // 4) Show indexes
  const finalIdx = await users.indexes();
  console.log('Current indexes:', finalIdx.map(i => i.name));

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});


