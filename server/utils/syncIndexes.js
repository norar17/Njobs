import User from '../models/User.js';

export const syncUserIndexes = async () => {
  try {
    const collection = User.collection;
    const existingIndexes = await collection.indexes();

    const phoneIndex = existingIndexes.find((idx) => idx.key && idx.key.phone === 1);

    const isCorrectPartialIndex =
      phoneIndex &&
      phoneIndex.unique &&
      phoneIndex.partialFilterExpression &&
      JSON.stringify(phoneIndex.partialFilterExpression) === JSON.stringify({ phone: { $type: 'string' } });

    if (phoneIndex && !isCorrectPartialIndex) {
      console.log('Dropping outdated phone index to apply partial unique constraint...');
      await collection.dropIndex(phoneIndex.name);
    }

    await User.syncIndexes();
  } catch (err) {
    console.error('Failed to sync user indexes:', err.message);
  }
};
