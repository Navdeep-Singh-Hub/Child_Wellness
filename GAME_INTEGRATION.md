# Occupational Therapy Games Integration

## Overview
Two specialized games for occupational therapy that align with speech & language pathology (AAC) and fine motor skill development:

### Game 1: Big Tap Target (🫧)
- **Purpose**: Large motor control, visual tracking, success reinforcement
- **Mechanics**: Players tap randomly spawning colored bubbles to earn stars
- **Features**:
  - 12 rounds of bubble-popping
  - Visual feedback with sparkle bursts
  - Sound effects (pop sound) & haptic feedback
  - Star counter tracking
  - XP rewards system
- **Component**: `components/game/BigTapTarget.tsx`
- **Skills Trained**: Fine motor control, visual attention, goal-directed tapping

---

### Game 2: Red Circle Tap (🔴)
- **Purpose**: Shape discrimination, color recognition, selective motor response
- **Mechanics**: 8 rounds where children tap the glowing red circle (correct) and avoid the blue square (incorrect)
- **Features**:
  - Two shapes per round (red circle vs blue square)
  - Red circle has animated glow cue
  - Success: star counter increases, success sound, haptic feedback
  - Error: gentle screen shake, warning sound, no punishment
  - Completion screen with accuracy, XP, and results
- **Component**: `components/game/TapRedCircleGame.tsx`
- **Skills Trained**: 
  - Shape discrimination
  - Motor control & targeting
  - Attention & visual search
  - Error tolerance (safe, non-punishing errors)

---

## Implementation Details

### Frontend Components

#### `components/game/TapRedCircleGame.tsx`
```typescript
export const TapRedCircleGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  // 8-round game with:
  // - Glow animation on red circle
  // - Shake animation on wrong taps
  // - Sound effects (success/error)
  // - Haptic feedback
  // - XP logging & results screen
}
```

**Key Features**:
- **Animations**: Reanimated v3 for smooth glow and shake effects
- **Audio**: Expo Audio for success/error sounds
- **Haptics**: Expo Haptics for tactile feedback (Success on correct, Warning on error)
- **XP Integration**: Logs results to `logGameAndAward()` with skill tags

---

### Backend Routes

#### POST `/api/games/tap-red-circle/event`
**Purpose**: Log individual game attempts for analytics

**Request Body**:
```json
{
  "userId": "child_123",
  "round": 1,
  "isCorrect": true
}
```

**Response**:
```json
{
  "success": true,
  "eventId": "6123abc..."
}
```

**Model** (`backend/models/GameEvent.js`):
```javascript
{
  userId: String,
  gameKey: "tap_red_circle",
  round: Number,
  isCorrect: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

### Game Menu Integration

Both games are now integrated into the main Games screen menu:

```tsx
// app/(tabs)/Games.tsx
const games: MenuGame[] = [
  {
    id: 'bigTap',
    title: 'Big Tap Target',
    emoji: '🫧',
    description: 'Tap the big bubble to pop it! Track stars as you go.',
    color: '#22C55E',
    gradient: ['#22C55E', '#16A34A'],
  },
  // ... other games ...
  {
    id: 'tapRedCircle',
    title: 'Red Circle Tap',
    emoji: '🔴',
    description: 'Tap the glowing red circle to build motor control and attention!',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
];
```

---

## Occupational Therapy Alignment

### Red Circle Tap Targets These OT Goals:
| Goal | Implementation |
|------|-----------------|
| **Visual Attention** | Red circle glows to cue attention; must locate among two shapes |
| **Shape Discrimination** | Must distinguish red circle from blue square |
| **Motor Planning** | Child plans & executes finger tap to target |
| **Feedback Tolerance** | Errors produce gentle shake only—no harsh sounds or punishment |
| **Selective Response** | Child learns to inhibit tap to blue square (impulse control) |
| **Success Reinforcement** | Star counter, sound, haptics reward correct taps |

### Sensory Profile Considerations:
- **Low-sensory**: No flashing lights; soft, non-aggressive sounds (volume 0.5)
- **Haptic Cues**: Gentle success & warning notifications only
- **No Punishment**: Wrong taps produce neutral feedback (shake), not negative reinforcement
- **Progressive**: 8 rounds allow child to build confidence

---

## XP & Progress Integration

Both games log results via `logGameAndAward()`:

```typescript
const result = await logGameAndAward({
  type: 'tapRedCircle',
  correct: finalCorrect,
  total: 8,
  accuracy: (finalCorrect / 8) * 100,
  xpAwarded: xp,
  skillTags: ['shape-discrimination', 'motor-control', 'attention'],
});
```

- **XP Formula**: `finalCorrect * 15` (up to 120 XP for 8/8)
- **Skill Tags**: Logged for therapist dashboard analytics
- **Results Saved**: Timestamp and XP added to user profile

---

## Audio & Haptics

### Enabled Platforms:
- **Audio**: iOS/Android (expo-av)
- **Haptics**: iOS/Android via expo-haptics
- **Web**: Audio skipped (audio.ogg fetches may fail); haptics unavailable

### Sound Files:
- **Success**: `https://actions.google.com/sounds/v1/cartoon/coin.ogg` (120ms)
- **Error**: `https://actions.google.com/sounds/v1/cartoon/slide_whistle_down.ogg` (120ms)

---

## Testing Checklist

- [ ] Navigate to Games menu; see both games listed
- [ ] Tap "Big Tap Target" → bubbles spawn and can be popped
- [ ] Tap "Red Circle Tap" → red circle glows, blue square visible
  - [ ] Tap red circle → star ++, success sound, haptic
  - [ ] Tap blue square → gentle shake, warning sound, no penalty
  - [ ] Complete 8 rounds → results screen shows accuracy & XP
- [ ] Results saved to backend (check `logGameAndAward` call)
- [ ] XP updates in profile after game completion
- [ ] Back button returns to Games menu

---

## Future Enhancements

1. **Difficulty Levels**: Reduce shape size or add time pressure for Red Circle Tap
2. **Sound Customization**: Allow therapist to disable/customize audio
3. **Session Summary**: Show progression across multiple game sessions
4. **Adaptive Difficulty**: Auto-scale based on accuracy (e.g., smaller shapes, faster rounds)
5. **Therapist Dashboard**: View per-child game metrics, skill growth over time

---

## File Structure

```
app/(tabs)/
  └─ Games.tsx                      // Main games screen with menu

components/game/
  ├─ BigTapTarget.tsx               // Game 1 component
  ├─ TapRedCircleGame.tsx            // Game 2 component (updated)
  └─ FX.tsx                          // Shared animations (SparkleBurst, etc.)

backend/
  models/
    └─ GameEvent.js                 // Game event logging schema

  routes/
    └─ gameRoutes.js                // POST /api/games/tap-red-circle/event

  server.js                          // Routes mounted at /api/games
```

---

## Key Imports & Dependencies

```typescript
// React Native & Expo
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Animations
import Animated, { useAnimatedStyle, withSpring, ... } from 'react-native-reanimated';

// API integration
import { logGameAndAward, recordGame } from '@/utils/api';

// Components
import ResultCard from './ResultCard';
```

---

## Notes for Therapists

- **Big Tap Target** is best for initial sessions (large targets, easy wins)
- **Red Circle Tap** adds complexity (two-choice discrimination, impulse control)
- Both games reward correct responses only; errors are safe and non-punishing
- Progress tracked in XP and skill tags—can be reviewed per-session
