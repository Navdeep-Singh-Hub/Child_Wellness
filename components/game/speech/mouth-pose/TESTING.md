# Level 5 mouth detection — APK test matrix

## Build

- Use **EAS preview / dev client APK** or `npm run android` — not Expo Go.
- Grant **camera** (front) on first launch.

## Sessions

| Session | Camera | Notes |
|---------|--------|-------|
| 1, 3 | No | Mic only — unchanged |
| 2, 4, 5, 6 | Yes | Pose match + Good try |
| 7, 8 | Hybrid | Face-present gate + tap |
| 9 | Weak | Tongue hint optional; Good try primary |
| 10 | Yes | Mixed poses |

## Checks

1. Open **Speech → Level 5 → Session 2 → Open–Close Dance**.
2. Status: “Camera on” when face visible; “Looking for your mouth” when not.
3. Open mouth on **open** prompt → auto-advance within ~1–2 s.
4. Close lips on **close** prompt → auto-advance.
5. No match → stays on prompt; **Good try** still advances.
6. Expo Go / no camera → Good try + tap only; no crash.
7. Low light → partial match or Good try; no error sounds.

## LAN web (optional QA)

- MediaPipe path via browser; thresholds may differ from APK — tune on APK first.
