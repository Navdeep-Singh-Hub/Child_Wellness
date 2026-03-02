# Sample optimized queries (Admin Analytics)

Examples of aggregations used for the admin dashboard. All use indexes on `Session`, `User`, `UserTherapyProgress`, and `ActivityLog`.

## 1. Active users (daily)

```javascript
const dayStart = new Date();
dayStart.setHours(0, 0, 0, 0);
await User.countDocuments({ updatedAt: { $gte: dayStart } });
```

Index: `User: updatedAt` (or use existing timestamps).

## 2. Time per game (from game logs)

```javascript
await Session.aggregate([
  { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
  { $unwind: '$gameLogs' },
  { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
  {
    $group: {
      _id: '$gameLogs.type',
      totalDurationMs: { $sum: '$gameLogs.durationMs' },
      plays: { $sum: 1 },
    },
  },
  { $sort: { totalDurationMs: -1 } },
  { $limit: 50 },
]);
```

Index: `Session: userId`, and ensure `gameLogs.at` is used in $match so MongoDB can use it.

## 3. Top performing users (accuracy)

```javascript
await Session.aggregate([
  { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
  { $unwind: '$gameLogs' },
  { $match: { 'gameLogs.at': { $gte: start, $lte: end }, 'gameLogs.total': { $gt: 0 } } },
  {
    $group: {
      _id: '$userId',
      totalCorrect: { $sum: '$gameLogs.correct' },
      totalQuestions: { $sum: '$gameLogs.total' },
      gamesPlayed: { $sum: 1 },
    },
  },
  { $addFields: { accuracy: { $multiply: [{ $divide: ['$totalCorrect', '$totalQuestions'] }, 100] } } },
  { $sort: { accuracy: -1 } },
  { $limit: 20 },
  { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
]);
```

## 4. Therapy-wise enrolled counts

```javascript
await UserTherapyProgress.aggregate([
  { $unwind: '$therapies' },
  { $group: { _id: '$therapies.therapy', count: { $sum: 1 } } },
]);
```

## 5. Drop-off (completion rate per game)

```javascript
await Session.aggregate([
  { $match: { 'gameLogs.at': { $gte: start, $lte: end } } },
  { $unwind: '$gameLogs' },
  {
    $group: {
      _id: '$gameLogs.type',
      totalStarts: { $sum: 1 },
      completed: { $sum: { $cond: [{ $gte: ['$gameLogs.total', 1] }, 1, 0] } },
    },
  },
  { $match: { totalStarts: { $gte: 5 } } },
  { $project: { gameKey: '$_id', totalStarts: 1, completed: 1, completionRate: { $multiply: [{ $divide: ['$completed', '$totalStarts'] }, 100] } } },
]);
```

## Indexes (recommended)

- `Session`: `{ userId: 1 }`, `{ "gameLogs.at": 1 }`
- `User`: `{ updatedAt: 1 }`, `{ auth0Id: 1 }`
- `UserTherapyProgress`: `{ userId: 1 }`
- `ActivityLog`: see `models/ActivityLog.js` (userId, createdAt, therapy, eventType compounds)
