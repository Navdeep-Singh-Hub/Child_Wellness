# How Games Are Displayed in Therapy Progress

## Overview
Games from the `components/game/` folder are displayed in the therapy progress system through a multi-level navigation structure.

## Navigation Flow

### 1. TherapyProgress.tsx (Entry Point)
- **Location**: `app/(tabs)/TherapyProgress.tsx`
- **Purpose**: Shows the hierarchy: Therapies → Levels → Sessions
- **Structure**:
  - 6 Therapies (speech, occupational, behavioral, special-education, daily-activities, therapy-avatar)
  - 10 Levels per therapy
  - 10 Sessions per level
  - 5 Games per session

### 2. SessionGames.tsx (Game Selection Screen)
- **Location**: `app/(tabs)/SessionGames.tsx`
- **Purpose**: Displays available games for a specific therapy/level/session combination
- **Navigation**: Accessed when user clicks a session card in TherapyProgress

## How Games Are Mapped

### Step 1: Game Availability Flags
Each game has an availability flag that determines if it's shown for a specific therapy/level/session:

```typescript
// Example from SessionGames.tsx
const isFollowBallAvailable = 
  therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;

const isBigTapAvailable = 
  therapyId === 'occupational' && levelNumber === 1 && sessionNumber === 1;
```

### Step 2: GAMES Array
All games are defined in a `GAMES` array with metadata:

```typescript
const GAMES: GameInfo[] = [
  {
    id: 'follow-ball',
    title: 'Follow the Ball',
    emoji: '⚽',
    description: 'Watch the ball and tap when it glows!',
    color: '#3B82F6',
    available: isFollowBallAvailable, // ← Controls visibility
  },
  // ... more games
];
```

### Step 3: Game Component Imports
Games are imported from `components/game/` folder:

```typescript
import { FollowTheBall } from '@/components/game/FollowTheBall';
import { RainbowCurveTraceGame } from '@/components/game/RainbowCurveTraceGame';
// ... 100+ game imports
```

### Step 4: Game Rendering
Games are rendered conditionally based on `currentGame` state:

```typescript
if (currentGame === 'follow-ball') {
  return <FollowTheBall onBack={() => setCurrentGame('menu')} />;
}

if (currentGame === 'rainbow-curve-trace') {
  return <RainbowCurveTraceGame onBack={() => setCurrentGame('menu')} />;
}
```

## File Structure

```
components/game/
├── FollowTheBall.tsx
├── RainbowCurveTraceGame.tsx
├── BigTapTarget.tsx
├── CatchTheBouncingStar.tsx
└── ... (100+ game files)

app/(tabs)/
├── TherapyProgress.tsx  ← Shows therapy/level/session hierarchy
└── SessionGames.tsx     ← Shows games for selected session
```

## Key Components

### 1. TherapyProgress.tsx
- **TherapyGrid**: Shows all 6 therapies
- **LevelsGrid**: Shows 10 levels for selected therapy
- **SessionsGrid**: Shows 10 sessions for selected level
  - Clicking a session navigates to SessionGames with params:
    ```typescript
    router.push({
      pathname: '/(tabs)/SessionGames',
      params: {
        therapy: 'speech',
        level: '1',
        session: '1',
      },
    });
    ```

### 2. SessionGames.tsx
- **GAMES Array**: Contains all game definitions with availability flags
- **Game Rendering**: Conditionally renders game components based on `currentGame` state
- **Game Menu**: Shows filtered games (only `available: true`) in a grid

## Adding a New Game

To add a new game to the system:

1. **Create game component** in `components/game/YourGame.tsx`
2. **Import it** in `SessionGames.tsx`:
   ```typescript
   import YourGame from '@/components/game/YourGame';
   ```
3. **Add availability flag**:
   ```typescript
   const isYourGameAvailable = 
     therapyId === 'speech' && levelNumber === 1 && sessionNumber === 1;
   ```
4. **Add to GAMES array**:
   ```typescript
   {
     id: 'your-game',
     title: 'Your Game',
     emoji: '🎮',
     description: 'Game description',
     color: '#3B82F6',
     available: isYourGameAvailable,
   }
   ```
5. **Add to GameKey type**:
   ```typescript
   type GameKey = 'menu' | 'your-game' | ...;
   ```
6. **Add rendering logic**:
   ```typescript
   if (currentGame === 'your-game') {
     return <YourGame onBack={() => setCurrentGame('menu')} />;
   }
   ```
7. **Add menu handler**:
   ```typescript
   if (game.id === 'your-game') setCurrentGame('your-game');
   ```

## Current Game Count

- **Total games in `components/game/`**: ~150+ game files
- **Games registered in SessionGames.tsx**: ~100+ games
- **Games per session**: 5 games
- **Total sessions**: 6 therapies × 10 levels × 10 sessions = 600 sessions
- **Total game slots**: 600 sessions × 5 games = 3,000 game slots

## Notes

- Games are filtered by `available` flag before display
- Only games with `available: true` show in the game menu
- Each game component receives an `onBack` prop to return to menu
- Game components are self-contained and handle their own logic
- Progress tracking is handled separately via API calls

