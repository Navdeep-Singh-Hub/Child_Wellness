# Special Education Level 2 – Web Sessions

Interactive educational web module for children 4–7 years. **Special Education · Level 2** (Sessions 1–3: Farm, Ocean, Jungle).

**Stack:** Next.js 14 (App Router), React, TypeScript, TailwindCSS, Framer Motion, canvas-confetti.

## Routes

### Special Ed Level 2 · Session 1 (Farm)
| Path | Page |
|------|------|
| `/farm-session-1` | Session intro – 4 game cards + Notebook link |
| `/farm-session-1/game/1` | Clean It Up (initial sound /c/) |
| `/farm-session-1/game/2` | I Spy Rhyming |
| `/farm-session-1/game/3` | Clap It Out (syllables) |
| `/farm-session-1/game/4` | Drag to Count (apples) |
| `/farm-session-1/notebook-task` | Notebook activity + photo upload |
| `/farm-session-1/result` | Farm Helper Badge + confetti |

### Special Ed Level 2 · Session 2 (Ocean)
| Path | Page |
|------|------|
| `/` | Home – choose Farm or Ocean session |
| `/ocean-session-2` | Session intro – 4 game cards + Notebook link |
| `/ocean-session-2/game/1` | Clean the Beach (initial sound /f/) |
| `/ocean-session-2/game/2` | I Spy Rhymes (wave/cave, fish/dish, etc.) |
| `/ocean-session-2/game/3` | Clap the Ocean Words (octopus, shark, turtle, dolphin) |
| `/ocean-session-2/game/4` | Match Sets to Numerals (drag group to number 1–5) |
| `/ocean-session-2/notebook-task` | Ocean notebook (5 fish + 5, or 3 rhyming words) |
| `/ocean-session-2/result` | Ocean Explorer Badge + confetti |

### Special Ed Level 2 · Session 3 (Jungle)
| Path | Page |
|------|------|
| `/jungle-session-3` | Session intro – 4 game cards + Notebook link |
| `/jungle-session-3/game/1` | Jungle Clean-Up (initial sound /l/) |
| `/jungle-session-3/game/2` | I Spy Jungle Rhymes (tree/bee, monkey/donkey, etc.) |
| `/jungle-session-3/game/3` | Clap Jungle Words (gorilla, toucan, tiger, parrot) |
| `/jungle-session-3/game/4` | Monkey Dot Maze (count dots 1–6, move monkey) |
| `/jungle-session-3/notebook-task` | Jungle notebook (rhyming words or syllables + drawings) |
| `/jungle-session-3/result` | Jungle Explorer Badge + confetti |

## Run

```bash
cd farm-module
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## API

- **POST /api/notebook-check** – Farm notebook. Returns `{ objects_detected, correct_count, c_words_present, feedback }` (mock).
- **POST /api/ocean-notebook-check** – Ocean notebook. Returns `{ objects_detected, correct_count, rhyming_words, feedback }` (mock).
- **POST /api/jungle-notebook-check** – Jungle notebook. Returns `{ rhymes_present, syllables_marked, drawing_present, feedback }` (mock).

## Design

- **Farm:** Green `#4CAF50`, Sky `#60A5FA`, Yellow `#FACC15`
- **Ocean:** Ocean Blue `#38BDF8`, Coral `#FB7185`, Sea Green `#34D399`
- **Jungle:** Jungle Green `#22C55E`, Leaf Green `#4ADE80`, Sun Yellow `#FACC15`
- **UI:** Large buttons, rounded-2xl cards, touch-friendly (min 44px targets)
